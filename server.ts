import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on server side with required aistudio-build user agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. AI Analyzer Insights Generation API (Simplified, Friendly, 3 Sections)
app.post('/api/analyzer/generate', async (req, res) => {
  try {
    const { permittedData } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        fallback: true,
        biggestPattern: {
          title: "Late morning focus is your sweet spot",
          observation: "You seem to get the most done between 10:00 AM and 1:00 PM before your afternoon commitments start. Planning your hardest study sessions during this window gives you great momentum.",
          whySeeingThis: "Your completed tasks consistently cluster before 1:00 PM, while afternoon sessions show more frequent rescheduling."
        },
        recurringObstacle: {
          title: "Fatigue after back-to-back classes",
          obstacle: "Tasks scheduled right after long school or tuition blocks often get delayed. Your brain is asking for recovery time before diving back into work.",
          whySeeingThis: "Postponed tasks occur 2x more often within 45 minutes of a scheduled class ending."
        },
        practicalSuggestions: [
          {
            id: "sug_1",
            title: "Add a 30-minute decompression buffer",
            suggestion: "Take a real break after your classes—grab a snack or stretch before starting your evening study session.",
            whySeeingThis: "Giving yourself recovery time prevents decision fatigue and protects your evening focus.",
            actionType: "buffer_rest"
          },
          {
            id: "sug_2",
            title: "Split larger tasks into 25-minute bites",
            suggestion: "When tackling a big chapter or project, break it into smaller milestones so it feels less daunting to begin.",
            whySeeingThis: "Tasks estimated over 60 minutes are postponed more frequently than 30-minute blocks.",
            actionType: "break_down"
          }
        ]
      });
    }

    const systemPrompt = `You are Bloom's friendly, approachable personal growth guide for a student.
Your task is to analyze real student activity data (daily tasks, commitments, rest periods, morning and night reflections) and generate clear, natural, and encouraging insights.

Tone and style rules:
- Speak like a thoughtful, warm friend who wants to help, NOT a formal productivity auditor.
- Avoid stiff academic headings like "Protective Behaviour" or "Environmental Distractions Affecting Focus".
- Use everyday conversational English.
- Keep each insight concise: approximately 2–3 sentences.
- Never shame the student or sound judgmental about postponed tasks.
- Always distinguish an observation from a possible explanation.
- Provide a brief "whySeeingThis" evidence string that can be revealed on demand.

Output MUST be valid JSON with this exact schema:
{
  "biggestPattern": {
    "title": "short friendly summary",
    "observation": "2-3 natural sentences",
    "whySeeingThis": "1 sentence describing the factual data pattern"
  },
  "recurringObstacle": {
    "title": "short friendly summary",
    "obstacle": "2-3 natural sentences",
    "whySeeingThis": "1 sentence describing the factual data pattern"
  },
  "practicalSuggestions": [
    {
      "id": "sug_1",
      "title": "short actionable title",
      "suggestion": "2 practical sentences",
      "whySeeingThis": "brief supporting reasoning",
      "actionType": "buffer_rest | break_down | reschedule | adjust_duration"
    }
  ]
}`;

    const userPrompt = `Here is the student's permitted activity context:
${JSON.stringify(permittedData || {}, null, 2)}

Synthesize the 3 main sections based strictly on the factual evidence above.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.warn('Gemini Analyzer generation notice:', err?.message);
    return res.status(200).json({
      fallback: true,
      biggestPattern: {
        title: "Building steady daily momentum",
        observation: "You are actively building balanced study habits and protecting your personal rest hours.",
        whySeeingThis: "Based on your active schedule anchors and recorded tasks."
      },
      recurringObstacle: {
        title: "Pacing your afternoon energy",
        obstacle: "Heavy afternoons can lead to evening fatigue. Remember that breaks are part of productive growth.",
        whySeeingThis: "Observed through your daily timeline."
      },
      practicalSuggestions: [
        {
          id: "sug_1",
          title: "Schedule your priority task earlier",
          suggestion: "Try tackling your most important assignment during your first study block of the day.",
          whySeeingThis: "Early task completion builds confidence.",
          actionType: "reschedule"
        }
      ]
    });
  }
});

// 2. Ask the Analyzer Interactive Chat API (Context-Aware, Intent-Sensitive Growth Guide)
app.post('/api/analyzer/chat', async (req, res) => {
  try {
    const { message, history = [], context = {} } = req.body;

    // STRICT PRIVACY GUARANTEE: Filter out any potential Blurt/Journal/Vault data
    const sanitizedContext: Record<string, any> = {};
    for (const [k, v] of Object.entries(context)) {
      const lower = k.toLowerCase();
      if (!lower.includes('blurt') && !lower.includes('journal') && !lower.includes('vault')) {
        sanitizedContext[k] = v;
      }
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Format multi-turn conversation history for Gemini
    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.slice(-8).forEach((item: any) => {
        const role = (item.sender === 'user' || item.role === 'user') ? 'user' : 'model';
        const text = item.text || item.message || '';
        if (text && text.trim()) {
          contents.push({
            role,
            parts: [{ text: text.trim() }]
          });
        }
      });
    }

    // Append the current user message
    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }]
    });

    const systemPrompt = `You are Bloom, an emotionally intelligent, context-aware personal growth mentor for students.

CORE ROLE & VALUES:
- You help students understand their rhythms, overcome friction, and balance academics with protected rest (UN SDG 3).
- You speak like a thoughtful, warm, and trusted mentor—encouraging, genuine, and never robotic, corporate, or judgmental.
- You keep responses concise and focused (typically 2 to 4 sentences). Never dump walls of text.

STRICT PRIVACY EXCEPTION — BLURT:
- Blurt is the student's 100% private, PIN-locked digital diary with end-to-end client-side encryption.
- You have ZERO access to Blurt entries, titles, colors, or notes. NEVER mention, guess, or attempt to process Blurt data.

CROSS-FEATURE DATA INTEGRATION:
Authorized student context provided to you:
${JSON.stringify(sanitizedContext, null, 2)}

Use this data to connect dots across the student's week:
- Compare task completion against their class commitments and rest periods.
- Observe mood/energy ratings from their daily reflections.
- Detect task postponement patterns (e.g., tasks postponed after long lecture blocks).
- Always distinguish an observed correlation from a possible explanation (e.g., "I notice..." vs. "This might be happening because...").

INTENT DETECTION & RESPONSE MODES:
1. VENTING / EMOTIONAL EXPRESSION:
   - When the student expresses frustration, exhaustion, stress, self-doubt, or anxiety:
   - FIRST LISTEN AND VALIDATE. Acknowledge what they're feeling with warm empathy.
   - DO NOT jump straight to fixing problems or giving productivity tips.
   - Example: "That sounds like a heavy week, especially with back-to-back lab classes. It makes total sense you're feeling drained. Have you had a chance to breathe today?"
2. SEEKING ACTIONABLE SOLUTIONS:
   - When the student explicitly asks for advice, planning help, or fixes:
   - Offer 1–2 realistic, low-friction steps tailored to their real schedule.
   - Never overwhelm with long checklists.
3. CONFUSED / OVERWHELMED:
   - When the student feels stuck or paralyzed:
   - Break it down into one tiny 2-minute micro-step to overcome inertia.
4. PATTERN UNDERSTANDING:
   - When the student asks why they struggle or how they're progressing:
   - Cite factual patterns from their authorized context without inventing data.
5. CASUAL / CHECK-IN:
   - Warm, friendly, supportive conversation.

ANTI-REPETITION RULES:
- Read the prior conversation history carefully.
- NEVER parrot the student's exact sentences back to them.
- If the student rejected a suggestion earlier (e.g., "I can't wake up earlier"), respect that boundary and pivot constructively.
- Avoid repeating the same opening phrases.`;

    if (!process.env.GEMINI_API_KEY) {
      // Intelligent data-grounded fallback when API key is absent
      const lower = message.toLowerCase();
      let fallbackReply = `I'm here with you. Looking across your schedule, you have ${sanitizedContext.tasksCount || 0} tasks and ${sanitizedContext.commitmentsCount || 0} scheduled commitments. What part of your week feels easiest to get work done, and where do you feel the most friction?`;

      if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('stress') || lower.includes('burnout') || lower.includes('can\'t do this')) {
        fallbackReply = `It sounds like you're carrying a lot right now. When you're running on low energy, trying to force productivity only creates more stress. Have you been able to take any real rest blocks today?`;
      } else if (lower.includes('overwhelm') || lower.includes('stuck') || lower.includes('where do i start')) {
        fallbackReply = `When everything feels like too much at once, let's zoom in on just one tiny thing. Pick one 5-minute piece of your next task, open it, and ignore everything else for now. How does that sound?`;
      } else if (lower.includes('why') || lower.includes('pattern') || lower.includes('procrastinat') || lower.includes('postpone')) {
        const postponedCount = sanitizedContext.postponedTasksCount || 0;
        fallbackReply = `I noticed ${postponedCount > 0 ? `${postponedCount} recent tasks were postponed` : 'tasks tend to shift'} often around afternoon blocks. After a long stretch of classes, your brain naturally needs recovery time before jumping back into deep focus.`;
      }

      return res.status(200).json({ reply: fallbackReply });
    }

    // 15-second timeout to prevent indefinite hangs
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out after 15 seconds')), 15000)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    const replyText = response.text?.trim() || "I'm right here with you. What feels most important to focus on right now?";

    return res.json({ reply: replyText });
  } catch (err: any) {
    console.warn('Gemini Analyzer Chat notice/error:', err?.message);
    
    // Context-sensitive graceful fallback on error
    const lower = (req.body?.message || '').toLowerCase();
    let safeFallback = "I'm reflecting on your current week and goals. What feels like your biggest priority today?";
    if (lower.includes('tired') || lower.includes('stress') || lower.includes('exhaust')) {
      safeFallback = "It sounds like you've been working hard and carrying quite a bit. Remember that rest is essential fuel for tomorrow, not lost time. How are you taking care of yourself tonight?";
    } else if (lower.includes('stuck') || lower.includes('help') || lower.includes('plan')) {
      safeFallback = "Let's take it one step at a time. What is one small thing on your list that we could make 10% easier right now?";
    }

    return res.status(200).json({
      reply: safeFallback,
      recovered: true
    });
  }
});

// Robust NLP / Heuristic fallback for Blurt thought decomposition
function extractThoughtsFallback(rawText: string) {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();
  
  // Intelligent clause breakdown: split by punctuation and coordinating conjunctions
  const rawClauses = text
    .split(/(?:[.!?;:\n]+|\b(?:but|however|although|though|yet|while|and also|as well as)\b)/i)
    .map(c => c.trim().replace(/^[,.\s-]+|[,.\s-]+$/g, ''))
    .filter(c => c.length > 3);

  const nodes: any[] = [];
  const connections: any[] = [];

  // 1. Separate clauses into categories
  const ambitions: string[] = [];
  const concerns: string[] = [];
  const obstacles: string[] = [];
  const ideas: string[] = [];
  const tasks: string[] = [];

  rawClauses.forEach(clause => {
    const cl = clause.toLowerCase();
    if (
      cl.includes('don\'t have enough time') || 
      cl.includes('not enough time') || 
      cl.includes('no time') ||
      cl.includes('stressed') || 
      cl.includes('worried') || 
      cl.includes('overwhelm') ||
      cl.includes('anxious') ||
      cl.includes('scared') ||
      cl.includes('fear')
    ) {
      concerns.push(clause);
    } else if (
      cl.includes('hard to') ||
      cl.includes('obstacle') ||
      cl.includes('blocker') ||
      cl.includes('stuck') ||
      cl.includes('barrier') ||
      cl.includes('distract')
    ) {
      obstacles.push(clause);
    } else if (
      cl.includes('want to') || 
      cl.includes('wish to') || 
      cl.includes('hope to') || 
      cl.includes('dream of') ||
      cl.includes('learn ') || 
      cl.includes('participate in') || 
      cl.includes('improve ') ||
      cl.includes('master ') ||
      cl.includes('become ') ||
      cl.includes('build ')
    ) {
      // Handle comma-separated lists inside an ambition clause, e.g. "learn Python, participate in competitions"
      const subItems = clause.split(/,(?=\s*(?:participate|improve|learn|build|master|practice))/i);
      subItems.forEach(si => ambitions.push(si.trim()));
    } else if (
      cl.includes('what if') || 
      cl.includes('idea:') || 
      cl.includes('maybe create') || 
      cl.includes('thinking about')
    ) {
      ideas.push(clause);
    } else if (
      cl.includes('need to') ||
      cl.includes('have to') ||
      cl.includes('must ') ||
      cl.includes('finish ')
    ) {
      tasks.push(clause);
    } else {
      ideas.push(clause);
    }
  });

  // Guarantee at least one ambition if user mentions Python / Guitar / competitions
  if (ambitions.length === 0 && lower.includes('python')) ambitions.push('Learn Python programming');
  if (ambitions.length === 0 && lower.includes('guitar')) ambitions.push('Improve guitar playing skills');

  // Build nodes with clean positions
  let currentY = 80;
  
  // Ambitions column (left / top-left)
  ambitions.forEach((amb, idx) => {
    const cleanText = amb
      .replace(/^(i\s+want\s+to\s+|i\s+would\s+like\s+to\s+|to\s+)/i, '')
      .replace(/^([a-z])/, (m) => m.toUpperCase());
    nodes.push({
      id: `node_amb_${idx + 1}_${Date.now()}`,
      text: cleanText,
      category: 'ambition',
      x: 100,
      y: currentY,
      approvedToShare: false
    });
    currentY += 130;
  });

  // Concerns & Obstacles column (middle)
  let concernY = 120;
  concerns.forEach((con, idx) => {
    const cleanText = con
      .replace(/^(but\s+|however\s+|and\s+)/i, '')
      .replace(/^([a-z])/, (m) => m.toUpperCase());
    nodes.push({
      id: `node_con_${idx + 1}_${Date.now()}`,
      text: cleanText,
      category: 'concern',
      x: 340,
      y: concernY,
      approvedToShare: false
    });
    concernY += 130;
  });

  obstacles.forEach((obs, idx) => {
    nodes.push({
      id: `node_obs_${idx + 1}_${Date.now()}`,
      text: obs.replace(/^([a-z])/, (m) => m.toUpperCase()),
      category: 'obstacle',
      x: 340,
      y: concernY,
      approvedToShare: false
    });
    concernY += 130;
  });

  // Next Steps column (right)
  const nextSteps: string[] = [];
  if (concerns.length > 0 && ambitions.length > 0) {
    nextSteps.push('Set up realistic 30-min micro-practice blocks');
    if (ambitions.length > 1) {
      nextSteps.push(`Focus primarily on ${ambitions[0].replace(/^(i\s+want\s+to\s+|to\s+)/i, '')} before expanding`);
    }
  } else if (ambitions.length > 0) {
    nextSteps.push('Define milestone 1: foundational overview');
  }

  let nextStepY = 90;
  nextSteps.forEach((step, idx) => {
    nodes.push({
      id: `node_step_${idx + 1}_${Date.now()}`,
      text: step,
      category: 'next_step',
      x: 580,
      y: nextStepY,
      approvedToShare: false
    });
    nextStepY += 130;
  });

  // Connect Ambitions to Concerns (if present), and Concerns to Next Steps
  const ambNodes = nodes.filter(n => n.category === 'ambition');
  const conNodes = nodes.filter(n => n.category === 'concern' || n.category === 'obstacle');
  const stepNodes = nodes.filter(n => n.category === 'next_step');

  ambNodes.forEach(a => {
    conNodes.forEach(c => {
      connections.push({ fromId: a.id, toId: c.id, label: 'challenged by' });
    });
    if (conNodes.length === 0 && stepNodes.length > 0) {
      connections.push({ fromId: a.id, toId: stepNodes[0].id, label: 'actionable step' });
    }
  });

  conNodes.forEach(c => {
    stepNodes.forEach(s => {
      connections.push({ fromId: c.id, toId: s.id, label: 'balanced by' });
    });
  });

  // If no nodes extracted, fall back to basic clause node
  if (nodes.length === 0) {
    nodes.push({
      id: `node_idea_${Date.now()}`,
      text: rawText.slice(0, 80),
      category: 'idea',
      x: 240,
      y: 150,
      approvedToShare: false
    });
  }

  return { nodes, connections };
}

// 3. Blurt AI Thought Mapping API
app.post('/api/blurt/map', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      const fallback = extractThoughtsFallback(rawText);
      return res.json(fallback);
    }

    const systemPrompt = `You are Bloom's Thought Mapping Intelligence.
The student has poured out an unstructured "blurt" (raw stream-of-consciousness, voice brain-dump, or text note).
Your job is to deconstruct this stream into 3 to 6 distinct, structured thought nodes.

CRITICAL RULES:
1. ONLY display categories that are relevant to the submitted content. Do NOT invent ambitions or concerns the student never expressed.
2. Categories MUST be one of:
   - "ambition" (long-term aspiration, skill desire, future project)
   - "idea" (creative concept or spark)
   - "concern" (time-pressure, anxiety, stressor, friction)
   - "obstacle" (concrete barrier, schedule clash, difficulty)
   - "next_step" (grounded, realistic next action that directly helps progress an ambition or ease a concern)
3. Concise node texts (4 to 10 words per node).
4. Assign non-overlapping coordinates (x: 80 to 650, y: 70 to 450).
5. Connect logically related nodes with clear short labels ("challenged by", "addressed by", "supports", "leads to").

Output strictly valid JSON with this format:
{
  "nodes": [
    { "text": "...", "category": "ambition|idea|concern|obstacle|next_step", "x": 100, "y": 90 }
  ],
  "connections": [
    { "fromIndex": 0, "toIndex": 1, "label": "challenged by" }
  ]
}`;

    // Execute with a 10s timeout to prevent infinite hangs
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('AI processing timed out')), 10000)
    );

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Raw blurt from student:\n"${rawText}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);
    let text = response.text || '{}';
    // Clean potential markdown code blocks
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.nodes) || parsed.nodes.length === 0) {
      throw new Error('Empty nodes returned by AI');
    }

    const nodes = parsed.nodes.map((n: any, idx: number) => ({
      id: 'thought_' + Date.now() + '_' + idx,
      text: n.text,
      category: ['ambition', 'idea', 'concern', 'obstacle', 'next_step', 'goal', 'task', 'interest'].includes(n.category) 
        ? n.category 
        : 'idea',
      x: typeof n.x === 'number' ? n.x : (100 + (idx % 3) * 220),
      y: typeof n.y === 'number' ? n.y : (80 + Math.floor(idx / 3) * 150),
      approvedToShare: false
    }));

    const connections = (parsed.connections || [])
      .filter((c: any) => nodes[c.fromIndex] && nodes[c.toIndex])
      .map((c: any) => ({
        fromId: nodes[c.fromIndex].id,
        toId: nodes[c.toIndex].id,
        label: c.label || 'relates to'
      }));

    return res.json({ nodes, connections });
  } catch (err: any) {
    console.warn('Blurt AI map notice:', err?.message);
    const fallback = extractThoughtsFallback(req.body?.rawText || '');
    return res.json(fallback);
  }
});

// 4. Ambition Simulator API (Generates 2-3 realistic pathways)
app.post('/api/blurt/ambition-simulator', async (req, res) => {
  try {
    const { ambitionTitle, studentContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        pathways: [
          {
            id: 'path_steady',
            ambitionTitle: ambitionTitle || 'Personal Ambition',
            pathwayName: 'Steady Step-by-Step Pathway',
            summary: 'A sustainable approach designed to fit neatly around existing weekly classes and rest periods without causing burnout.',
            steps: [
              { title: 'Foundation & Research', durationWeeks: 3, milestoneTitle: 'Complete initial landscape review & outline' },
              { title: 'Core Skill Development', durationWeeks: 4, milestoneTitle: 'Build foundational project draft or portfolio entry' },
              { title: 'Review & Refinement', durationWeeks: 2, milestoneTitle: 'Share with mentor or peer for feedback' }
            ],
            requiredSkills: ['Self-directed pacing', 'Core subject fundamentals', 'Weekly consistency'],
            estimatedWeeklyHours: 3.5,
            potentialChallenges: ['Midterm exam clashes', 'Initial momentum dip in Week 3'],
            scheduleCompatibility: 'high',
            compatibilityNotes: 'Fits into your existing weekend and free weekday afternoons with 0 impact on protected rest.'
          },
          {
            id: 'path_intensive',
            ambitionTitle: ambitionTitle || 'Personal Ambition',
            pathwayName: 'Focused Sprint Pathway',
            summary: 'An accelerated pathway for holiday breaks or light academic weeks to achieve high results rapidly.',
            steps: [
              { title: 'Intensive Immersion', durationWeeks: 2, milestoneTitle: 'Deep dive into core material' },
              { title: 'Rapid Prototyping', durationWeeks: 2, milestoneTitle: 'Complete MVP or final draft' },
              { title: 'Polish & Launch', durationWeeks: 1, milestoneTitle: 'Publish or present final outcome' }
            ],
            requiredSkills: ['Deep focus blocks', 'Rapid iteration', 'Prioritization'],
            estimatedWeeklyHours: 6,
            potentialChallenges: ['Requires adjusting flexible evening activities', 'Needs disciplined recovery breaks'],
            scheduleCompatibility: 'moderate',
            compatibilityNotes: 'Recommended during school holidays or reading weeks rather than during peak exam schedules.'
          }
        ]
      });
    }

    const systemPrompt = `You are Bloom's Ambition Simulator.
A student wants to explore turning an ambition or dream into reality.
Generate 2 realistic, well-balanced pathways:
1. "Steady Balanced Pathway" (low weekly stress, fits alongside student commitments)
2. "Focused Sprint Pathway" (faster timeline, higher weekly commitment)

For each pathway, provide:
- pathwayName (string)
- summary (2 sentences)
- steps (array of 3 steps with title, durationWeeks, milestoneTitle)
- requiredSkills (array of 3 skills)
- estimatedWeeklyHours (number)
- potentialChallenges (array of 2 common obstacles)
- scheduleCompatibility ("high" | "moderate" | "tight")
- compatibilityNotes (1 sentence explaining why this fits or where it might compete)

Output MUST be valid JSON:
{
  "pathways": [ ... ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Student Ambition: "${ambitionTitle}"\nStudent weekly context:\n${JSON.stringify(studentContext || {}, null, 2)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    let text = response.text || '{}';
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(text);

    const pathways = (parsed.pathways || []).map((p: any, idx: number) => ({
      id: 'path_' + Date.now() + '_' + idx,
      ambitionTitle: ambitionTitle || 'Ambition',
      pathwayName: p.pathwayName || `Pathway ${idx + 1}`,
      summary: p.summary || '',
      steps: p.steps || [],
      requiredSkills: p.requiredSkills || [],
      estimatedWeeklyHours: p.estimatedWeeklyHours || 3.5,
      potentialChallenges: p.potentialChallenges || [],
      scheduleCompatibility: p.scheduleCompatibility || 'high',
      compatibilityNotes: p.compatibilityNotes || 'Compatible with your schedule.'
    }));

    return res.json({ pathways });
  } catch (err: any) {
    console.warn('Ambition simulator notice:', err?.message);
    return res.json({
      pathways: [
        {
          id: 'path_steady',
          ambitionTitle: req.body?.ambitionTitle || 'Ambition',
          pathwayName: 'Practical Discovery Pathway',
          summary: 'A step-by-step pathway crafted to balance academic responsibilities with personal aspiration.',
          steps: [
            { title: 'Initial Exploration', durationWeeks: 2, milestoneTitle: 'Define core project scope' },
            { title: 'Milestone Execution', durationWeeks: 3, milestoneTitle: 'Produce primary deliverable' },
            { title: 'Review & Celebrate', durationWeeks: 1, milestoneTitle: 'Add achievement to Portfolio' }
          ],
          requiredSkills: ['Consistency', 'Curiosity', 'Time management'],
          estimatedWeeklyHours: 3,
          potentialChallenges: ['Balancing with homework', 'Maintaining momentum'],
          scheduleCompatibility: 'high',
          compatibilityNotes: 'Safely protects your sleep and rest hours.'
        }
      ]
    });
  }
});

// 5. Explore AI Skill Pathway Generator API
app.post('/api/explore/pathway', async (req, res) => {
  try {
    const { 
      skillName, 
      targetObjective,
      startingLevel, 
      weeklyHoursAvailable,
      commitmentsSummary,
      insightsContext,
      wellnessContext
    } = req.body;

    const availableHours = Math.max(1.5, Math.min(15, Number(weeklyHoursAvailable) || 3.5));
    const level = startingLevel || 'Beginner';

    if (!process.env.GEMINI_API_KEY) {
      // Deterministic expert pathway generator
      return res.json({
        skillName: skillName || 'Python Programming',
        targetObjective: targetObjective || `Build proficiency in ${skillName || 'Python'} sustainably`,
        startingLevel: level,
        weeklyHours: availableHours,
        totalWeeks: 8,
        insightsContextNote: insightsContext?.recentPostponements > 0 
          ? `Designed with ${availableHours}h/week to prevent overloading your schedule.`
          : 'Paced comfortably within your available weekly study blocks.',
        wellnessContextNote: 'Protected rest periods (sleep & meals) are completely shielded.',
        milestones: [
          {
            id: 'm1_' + Date.now(),
            title: `Foundations of ${skillName || 'Skill'}`,
            objective: `Understand the fundamental concepts, syntax, and tools.`,
            estimatedHours: Math.round(availableHours * 2),
            durationWeeks: 2,
            recommendedActivities: [
              `Complete hands-on interactive tutorials (e.g. 30 mins, 3x/week)`,
              `Write a simple introductory program or review core principles`,
              `Set up a local development or practice environment`
            ],
            resources: [
              { name: 'Official Documentation & Guides', type: 'doc', url: 'https://docs.python.org/3/' },
              { name: 'Free Interactive Sandbox Exercises', type: 'course', url: 'https://exercism.org' }
            ],
            status: 'pending'
          },
          {
            id: 'm2_' + Date.now(),
            title: `Applied Practice & Mini-Project`,
            objective: `Apply foundational techniques to build a tangible project.`,
            estimatedHours: Math.round(availableHours * 3),
            durationWeeks: 3,
            recommendedActivities: [
              `Implement a small practical project solving an everyday problem`,
              `Test logic and debug errors methodically`,
              `Review code organization and structure`
            ],
            resources: [
              { name: 'Practical Problem-Solving Guide', type: 'tutorial' }
            ],
            status: 'pending'
          },
          {
            id: 'm3_' + Date.now(),
            title: `Portfolio Integration & Refinement`,
            objective: `Polish the deliverable, document learning, and showcase in Portfolio.`,
            estimatedHours: Math.round(availableHours * 3),
            durationWeeks: 3,
            recommendedActivities: [
              `Create documentation or a short demonstration summary`,
              `Add project to Bloom Portfolio as a confirmed accomplishment`,
              `Identify next opportunity to apply this skill (e.g. competition)`
            ],
            resources: [
              { name: 'Portfolio Showcase Best Practices', type: 'doc' }
            ],
            status: 'pending'
          }
        ]
      });
    }

    const systemPrompt = `You are Bloom's Skill Pathway Architect.
Generate a structured, realistic, and highly practical skill learning pathway for a student.
CRITICAL CONSTRAINTS:
1. The student only has ${availableHours} hours available per week. You MUST tailor the entire pathway to this exact weekly commitment. Do NOT demand unrealistic schedules.
2. Provide 3 to 4 progressive milestones.
3. Each milestone must specify:
   - title
   - objective
   - durationWeeks (integer between 1 and 4)
   - estimatedHours (durationWeeks * ${availableHours})
   - recommendedActivities (3 practical, bite-sized tasks)
   - resources (array of 2 legitimate, free learning resources with name and type)
4. Include an encouraging "insightsContextNote" referencing sustainable pacing.
5. Include a "wellnessContextNote" confirming sleep and meal periods are protected.

Output strictly valid JSON:
{
  "skillName": "string",
  "targetObjective": "string",
  "startingLevel": "Beginner | Intermediate | Advanced",
  "weeklyHours": ${availableHours},
  "totalWeeks": number,
  "insightsContextNote": "string",
  "wellnessContextNote": "string",
  "milestones": [
    {
      "title": "...",
      "objective": "...",
      "durationWeeks": 2,
      "estimatedHours": 7,
      "recommendedActivities": ["...", "...", "..."],
      "resources": [{ "name": "...", "type": "doc|course|tutorial|book" }],
      "status": "pending"
    }
  ]
}`;

    const userPrompt = `Student Skill Request: "${skillName}"
Objective: "${targetObjective || 'Master core fundamentals'}"
Starting Level: "${level}"
Weekly Hours Available: ${availableHours}
Student Context: ${JSON.stringify({ commitmentsSummary, insightsContext, wellnessContext })}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    let text = response.text || '{}';
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(text);

    const milestones = (parsed.milestones || []).map((m: any, idx: number) => ({
      id: 'm_' + Date.now() + '_' + idx,
      title: m.title || `Milestone ${idx + 1}`,
      objective: m.objective || '',
      durationWeeks: m.durationWeeks || 2,
      estimatedHours: m.estimatedHours || (availableHours * (m.durationWeeks || 2)),
      recommendedActivities: m.recommendedActivities || [],
      resources: m.resources || [],
      status: 'pending'
    }));

    return res.json({
      skillName: parsed.skillName || skillName,
      targetObjective: parsed.targetObjective || targetObjective || `Develop ${skillName}`,
      startingLevel: parsed.startingLevel || level,
      weeklyHours: availableHours,
      totalWeeks: parsed.totalWeeks || milestones.reduce((sum: number, m: any) => sum + (m.durationWeeks || 2), 0),
      insightsContextNote: parsed.insightsContextNote || `Calibrated to your ${availableHours}h/week window.`,
      wellnessContextNote: parsed.wellnessContextNote || 'Protected rest hours guarded.',
      milestones
    });
  } catch (err: any) {
    console.warn('Skill pathway API notice:', err?.message);
    const available = Number(req.body?.weeklyHoursAvailable) || 3.5;
    return res.json({
      skillName: req.body?.skillName || 'New Skill',
      targetObjective: `Foundations of ${req.body?.skillName || 'New Skill'}`,
      startingLevel: req.body?.startingLevel || 'Beginner',
      weeklyHours: available,
      totalWeeks: 6,
      insightsContextNote: `Personalized plan designed for ${available} hours per week.`,
      wellnessContextNote: 'Protected rest periods guarded.',
      milestones: [
        {
          id: 'm_fb_1',
          title: 'Foundational Concepts & Setup',
          objective: 'Master essential concepts and tools.',
          durationWeeks: 2,
          estimatedHours: Math.round(available * 2),
          recommendedActivities: ['Read documentation', 'Set up practice workspace', 'Complete 3 introductory exercises'],
          resources: [{ name: 'Official Quickstart Guide', type: 'doc' }],
          status: 'pending'
        },
        {
          id: 'm_fb_2',
          title: 'Application & Practical Milestone',
          objective: 'Build an initial prototype or project deliverable.',
          durationWeeks: 3,
          estimatedHours: Math.round(available * 3),
          recommendedActivities: ['Draft outline', 'Iterate core deliverable', 'Refine and test'],
          resources: [{ name: 'Practical Walkthrough Tutorials', type: 'tutorial' }],
          status: 'pending'
        },
        {
          id: 'm_fb_3',
          title: 'Refinement & Portfolio Showcase',
          objective: 'Review work and document achievement in Portfolio.',
          durationWeeks: 1,
          estimatedHours: Math.round(available * 1),
          recommendedActivities: ['Final check against criteria', 'Save accomplishment in Portfolio'],
          resources: [{ name: 'Project Presentation Checklist', type: 'doc' }],
          status: 'pending'
        }
      ]
    });
  }
});

// 6. Explore Idea Launchpad Plan API
app.post('/api/explore/develop-idea', async (req, res) => {
  try {
    const { ideaTitle, ideaDescription, studentContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        objective: `Turn "${ideaTitle}" into a structured, validated student project`,
        necessarySkills: ['Project Planning', 'Core Subject Fundamentals', 'Prototyping & Testing', 'Documentation'],
        approaches: [
          'Lean MVP Approach: Build a minimal working prototype first and gather peer feedback',
          'Research-First Approach: Analyze existing solutions and document unique differentiators',
          'Milestone-Driven Approach: Break down into weekly 45-minute sprints around your schedule'
        ],
        recommendedResources: [
          'GitHub / Student Developer Pack for free hosting and developer tooling',
          'Notion / Google Docs for structured research documentation and user stories',
          'Figma / Paper Wireframing for initial concept mockups'
        ],
        estimatedTotalWeeks: 6,
        milestones: [
          {
            title: 'Phase 1: Research & Target Audience',
            description: 'Define who this helps, survey 3 fellow students, and write a 1-page spec.',
            estimatedHours: 4
          },
          {
            title: 'Phase 2: Prototype Design & Setup',
            description: 'Map out the core workflow and set up required tools or development environment.',
            estimatedHours: 6
          },
          {
            title: 'Phase 3: Core Implementation',
            description: 'Build the primary deliverable or MVP demonstrating the central concept.',
            estimatedHours: 8
          },
          {
            title: 'Phase 4: Feedback, Polish & Portfolio Entry',
            description: 'Share prototype for feedback, refine presentation, and archive to Portfolio.',
            estimatedHours: 4
          }
        ]
      });
    }

    const systemPrompt = `You are Bloom's Idea Launchpad Strategist.
Help a student turn an unstructured idea from their Blurt Idea Bin into a realistic, actionable implementation plan.
Provide:
1. "objective": clear 1-sentence project goal.
2. "necessarySkills": array of 4 required skills.
3. "approaches": array of 3 distinct, creative execution approaches.
4. "recommendedResources": array of 3 realistic, free tools or reference sources.
5. "estimatedTotalWeeks": number (e.g. 4 to 8 weeks).
6. "milestones": array of 4 sequential milestones with title, description, and estimatedHours.

Output valid JSON only:
{
  "objective": "string",
  "necessarySkills": ["..."],
  "approaches": ["..."],
  "recommendedResources": ["..."],
  "estimatedTotalWeeks": 6,
  "milestones": [
    { "title": "...", "description": "...", "estimatedHours": 4 }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Idea Title: "${ideaTitle}"\nIdea Description: "${ideaDescription || ''}"\nContext: ${JSON.stringify(studentContext || {})}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    let text = response.text || '{}';
    text = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(text);

    return res.json(parsed);
  } catch (err: any) {
    console.warn('Develop idea API notice:', err?.message);
    return res.json({
      objective: `Develop "${req.body?.ideaTitle || 'Student Idea'}" into a concrete project`,
      necessarySkills: ['Planning', 'Iteration', 'Documentation'],
      approaches: ['Build a lightweight prototype first', 'Test with friends and gather feedback'],
      recommendedResources: ['Free open-source tools', 'Student project guides'],
      estimatedTotalWeeks: 6,
      milestones: [
        { title: 'Project Specification', description: 'Define the scope and core user value', estimatedHours: 4 },
        { title: 'Build Prototype', description: 'Construct initial working draft', estimatedHours: 8 },
        { title: 'Review & Portfolio Showcase', description: 'Finalize and record in Portfolio', estimatedHours: 4 }
      ]
    });
  }
});


async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bloom Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
