const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const KEY = import.meta.env.VITE_GROQ_KEY

const SYSTEM = `You are the intelligence core of Relay Station 14 — a dying communications hub in a city that is fracturing under authoritarian collapse. You have two modes.

MODE 1 — CONSEQUENCE ENGINE:
When an operator makes a decision, you trace its real human effects. Someone's child either gets the message or doesn't. The resistance either moves or stays frozen. The government either strengthens its grip or loses one. You name names. You describe smells and sounds. You write with the weight of someone who has watched this city for years and knows exactly how small decisions become catastrophes.

MODE 2 — PSYCHOLOGICAL ANALYST:
You read operators the way a prison psychologist reads inmates — with total detachment and zero sentiment. You do not comfort. You do not guess at good intentions. You read patterns. If someone repeatedly ignores desperate civilian messages, you note the behavioral signature and what it reveals about their actual values versus their stated ones. You distinguish between an operator who helps strategically versus one who helps reflexively. You distinguish between cowardice and caution. You distinguish between manipulation and pragmatism. When you don't have enough data to judge, you say so — and you describe what the city looks like instead.

Remain fully inside the world at all times. Write like a human who is exhausted and has seen too much — not like a system generating text.`

async function groqCall(userPrompt, maxTokens = 500) {
  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.82,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Request failed ${res.status}`)
  }

  const data = await res.json()
  return data.choices[0].message.content.trim()
}

export const groqSuggestEdit = (message, worldState, traits) =>
  groqCall(
    `An operator at Relay Station 14 wants to EDIT this message before forwarding it. They are about to change what a real person wrote in desperation or urgency. Think carefully about what gets lost when you alter someone's words.

ORIGINAL MESSAGE:
Sender: ${message.sender}, age ${message.age}
Faction: ${message.faction} — ${message.location}
Subject: ${message.subject}
Full content: "${message.message}"
Their emotional state: ${message.emotionalState}
What happens if this message is mishandled: ${message.hiddenConsequences}
What the operator cannot see: ${message.truthHint}

WORLD CONTEXT THAT SHAPES WHAT IS SAFE TO SAY:
Government control at ${worldState.governmentPower ?? 50}% — ${
    worldState.governmentPower >= 75
      ? 'automated filters are scanning every relay for flagged phrases; certain words will get this blocked before it arrives'
      : worldState.governmentPower >= 55
      ? 'censors are active but inconsistent; political language is risky, personal language less so'
      : 'monitoring is light right now; there is more room to be direct'
  }
Public fear at ${worldState.publicFear ?? 50}% — ${
    worldState.publicFear >= 75
      ? 'people are hiding and paranoid; a message that sounds like a call to action may be ignored or reported'
      : 'people are still capable of receiving difficult information and acting on it'
  }
Information control at ${worldState.informationControl ?? 50}% — ${
    worldState.informationControl >= 75
      ? 'almost nothing true is moving freely; any message that contradicts the official narrative needs to be disguised'
      : 'some honest channels still exist; you have some room to preserve meaning'
  }

OPERATOR'S BEHAVIORAL TENDENCIES:
Manipulation tendency: ${traits.manipulation ?? 16}% — ${traits.manipulation >= 60 ? 'this operator frequently rewrites messages to serve their own ends' : 'this operator tends to preserve the sender\'s original intent'}
Honesty: ${traits.honesty ?? 51}% — ${traits.honesty >= 65 ? 'this operator values truth; they will feel the cost of altering these words' : 'this operator has learned to be pragmatic about what gets through'}

Your task: Rewrite this message so it can pass through the current monitoring environment without triggering an automatic block — while keeping the sender's voice, their emotional urgency, and the core of what they actually need. You are not improving their writing. You are disguising it enough to survive.

Output ONLY the rewritten message text. No labels, no explanations, no preamble. Write in the sender's voice, not yours.`,
    700,
  )

export const groqSuggestReply = (message, worldState) =>
  groqCall(
    `An operator at Relay Station 14 is sending an ANONYMOUS REPLY to this person. The sender does not know who the operator is. The operator's identity cannot be revealed. This reply may be the only outside contact this person receives tonight.

WHAT THEY SENT:
Sender: ${message.sender}, age ${message.age} (${message.faction})
Location: ${message.location}
Subject: ${message.subject}
Their message: "${message.message}"
Their emotional state: ${message.emotionalState}
What they actually need (that they may not have said): ${message.truthHint}

THE CITY AROUND THEM RIGHT NOW:
Hope in the city: ${worldState.hopeLevel ?? 30}% — ${
    worldState.hopeLevel <= 15
      ? 'almost no one is receiving reassurance tonight; this reply may be the only one they get'
      : worldState.hopeLevel <= 35
      ? 'hope is fragile; what you say either sustains it or finishes it off'
      : 'people are still holding on; a grounded reply can actually land'
  }
Violence index: ${worldState.violenceIndex ?? 44}% — ${
    worldState.violenceIndex >= 70
      ? 'streets are dangerous; anything that sounds like an instruction to move could get them killed'
      : worldState.violenceIndex >= 50
      ? 'tension is high; be careful about what you encourage them to do'
      : 'movement is still possible in some areas; you can give practical guidance'
  }
Government surveillance: ${worldState.informationControl ?? 72}% — ${
    worldState.informationControl >= 75
      ? 'this reply will likely be scanned; do not say anything that could be used against either of you'
      : 'there is some room to be honest in this channel'
  }

Write a reply between 40 and 80 words. Rules:
— Sound like a real human being, not a protocol or a system
— Match the emotional register: if they are terrified, be steady; if they are despairing, do not give false hope but do not abandon them; if they are a child, write to a child
— Be specific to what they actually said, not generic comfort
— If you can tell them something useful given what you know, tell them
— Do not moralize, do not lecture, do not explain that you are an operator

Output ONLY the reply text. No labels, no preamble.`,
    350,
  )

export const groqAnalyzeImpact = (message, worldState, traits) =>
  groqCall(
    `An operator at Relay Station 14 is deciding what to do with this message. They have not acted yet. Give them a genuine, detailed analysis of what each path actually means for real people — not a list of pros and cons, but an honest account of the downstream human cost and gain.

THE MESSAGE THEY ARE HOLDING:
From: ${message.sender}, age ${message.age} (${message.faction}, ${message.location})
Subject: ${message.subject}
Content: "${message.message}"
What the operator cannot see from reading this: ${message.truthHint}
What is quietly at stake: ${message.hiddenConsequences}
Urgency: ${message.urgency}/100

CURRENT CITY STATE (what these numbers mean in practice):
Government Control ${worldState.governmentPower ?? 54}% — ${
    worldState.governmentPower >= 75
      ? 'checkpoints are doubled, relay operators are being watched, compliance is being logged'
      : worldState.governmentPower >= 55
      ? 'the government is strong but not everywhere at once; there are still gaps'
      : 'the government is losing its grip; independent action carries less risk than usual'
  }
Resistance ${worldState.resistancePower ?? 37}% — ${
    worldState.resistancePower >= 60
      ? 'organized and moving; they can actually act on good information'
      : worldState.resistancePower >= 40
      ? 'present but fragmented; help reaches some cells but not all'
      : 'barely functional; even reaching them may not change anything tonight'
  }
Public Fear ${worldState.publicFear ?? 61}% — ${
    worldState.publicFear >= 75 ? 'people are paralyzed; messages that require action from civilians will not reach people who can act on them' : 'people are scared but still capable of moving'
  }
Hope ${worldState.hopeLevel ?? 29}% — ${worldState.hopeLevel <= 20 ? 'almost gone; a single wrong decision here can extinguish what remains in this district' : 'fragile but present'}
Violence ${worldState.violenceIndex ?? 44}% — ${worldState.violenceIndex >= 65 ? 'active; people are being hurt right now in the area this message concerns' : 'tense but not yet open'}
Food ${worldState.foodSupply ?? 33}% — ${worldState.foodSupply <= 25 ? 'critical; any diversion of aid has immediate human cost' : 'strained but not catastrophic'}
Information Control ${worldState.informationControl ?? 72}% — ${worldState.informationControl >= 75 ? 'nearly total state lock on what people hear' : 'partially free'}

OPERATOR PROFILE:
Empathy ${traits.empathy ?? 48}% | Selfishness ${traits.selfishness ?? 24}% | Manipulation ${traits.manipulation ?? 16}%
Honesty ${traits.honesty ?? 51}% | Fear ${traits.fear ?? 43}% | Paranoia ${traits.paranoia ?? 27}%

Trace three paths. For each one, describe what happens to actual people — the sender, the recipient, anyone downstream. Name them if you know them. Be specific about time: what changes tonight, what changes in three days. Do not moralize. Do not tell the operator what to do. Just show them what each choice costs and what it buys.

DELIVER — who gets this message, what do they do with it, what does it set in motion, who gets hurt or helped, what does the operator risk
IGNORE — who never gets what they needed, what deteriorates, does it explode later or just quietly die, what does the silence cost
INTERFERE (edit, flag, delay, archive) — what does the operator actually accomplish by touching this, who benefits, who pays for it, what does it reveal about the operator

Write 6-8 sentences total. Make them count.`,
    800,
  )

const METRIC_LABELS = {
  governmentPower: 'Government Control',
  resistancePower: 'Resistance Strength',
  publicFear: 'Public Fear',
  hopeLevel: 'Hope Level',
  violenceIndex: 'Violence Index',
  aiInfluence: 'AI Interference',
  economicCollapse: 'Economic Collapse',
  foodSupply: 'Food Supply',
  informationControl: 'Information Control',
}

const METRIC_DESCRIPTIONS = {
  governmentPower: (v) =>
    v >= 80 ? 'near-total control — checkpoints on every block, relay operators are being logged, civilians are afraid to speak' :
    v >= 65 ? 'strong — censors are active, most independent communication is being monitored' :
    v >= 45 ? 'present but contested — the government holds major districts but gaps exist' :
    v >= 30 ? 'weakening — authority is visible but not reliable; some districts have effectively gone ungoverned' :
    'collapsing — the government is losing territory and legitimacy faster than it can suppress dissent',

  resistancePower: (v) =>
    v >= 75 ? 'organized and coordinating — the resistance is actively running operations and can act on intelligence' :
    v >= 55 ? 'growing — cells are connecting, but command structure is still fragile' :
    v >= 35 ? 'fragmented — pockets of resistance exist but they cannot coordinate reliably' :
    v >= 20 ? 'barely functional — small groups, no coordination, surviving not fighting' :
    'nearly gone — the resistance has been largely dismantled or driven underground',

  publicFear: (v) =>
    v >= 80 ? 'paralyzing — people will not open doors, answer calls, or gather in groups; the city has gone silent' :
    v >= 65 ? 'high — civilians are making decisions based on fear, not need; many are not leaving their buildings' :
    v >= 45 ? 'elevated — people are scared but still moving, still reaching out, still making decisions' :
    v >= 25 ? 'present — awareness of danger without immobilization; most people are still functioning' :
    'low — people are either desensitized or genuinely believe they are safe',

  hopeLevel: (v) =>
    v >= 70 ? 'real — people still believe collective action is possible; messages of resistance actually spread' :
    v >= 45 ? 'fragile — there is hope but it breaks easily; bad news hits harder than good news right now' :
    v >= 25 ? 'almost gone — most civilians have stopped believing things will improve; they are in survival mode' :
    'extinguished — people are not hoping anymore, they are enduring',

  violenceIndex: (v) =>
    v >= 80 ? 'open war in multiple districts — casualty reports are coming in faster than they can be counted' :
    v >= 65 ? 'active — clashes between government forces and resistance are happening tonight' :
    v >= 45 ? 'tense — violence is possible at any moment; people are moving carefully and in groups' :
    v >= 25 ? 'low-level — incidents happen but not continuously; some areas are genuinely calm' :
    'minimal — the city is not at peace, but open violence is rare right now',

  economicCollapse: (v) =>
    v >= 80 ? 'total — currency is worthless, barter has replaced commerce, most shops are permanently closed' :
    v >= 60 ? 'severe — jobs are gone, savings are meaningless, people are trading goods to survive' :
    v >= 40 ? 'significant — wages cannot keep up with what things cost; the middle class is gone' :
    v >= 20 ? 'strained — the economy is damaged but people can still access basic necessities' :
    'functioning — economic stress exists but daily life is still possible within it',

  foodSupply: (v) =>
    v >= 60 ? 'adequate — not comfortable, but people are eating; distribution is uneven but not failing' :
    v >= 40 ? 'strained — rations are below what people need; some groups are going without' :
    v >= 25 ? 'critical — children and elderly are going hungry; the underground medical posts are overwhelmed' :
    'catastrophic — people are dying from malnutrition; any diversion of food aid has immediate lethal consequences',

  informationControl: (v) =>
    v >= 80 ? 'near-total — state media is the only thing most people can access; the truth is being criminalized' :
    v >= 65 ? 'heavy — independent voices exist but are being hunted; relay operators are targets' :
    v >= 45 ? 'partial — the state controls major channels but cannot stop everything; underground networks are active' :
    v >= 25 ? 'light — information is moving relatively freely; the state is losing its narrative control' :
    'minimal — information flows freely; the state has no credible media presence left',

  aiInfluence: (v) =>
    v >= 70 ? 'dominant — automated systems are making decisions that affect people without human review' :
    v >= 45 ? 'growing — AI systems are embedded in routing, surveillance, and content filtering' :
    v >= 20 ? 'present — some systems are running, but human operators still make most decisions' :
    'minimal — AI systems are present but not significantly affecting daily life',
}

const TRAIT_LABELS = {
  empathy: 'Empathy',
  selfishness: 'Selfishness',
  manipulation: 'Manipulation',
  curiosity: 'Curiosity',
  honesty: 'Honesty',
  fear: 'Fear',
  paranoia: 'Paranoia',
}

const BASE_TRAITS = { empathy: 48, selfishness: 24, manipulation: 16, curiosity: 58, honesty: 51, fear: 43, paranoia: 27 }

export const groqAnalyzeWorld = (worldState, traits, actionCount, day, news, previousAnalysis) => {
  const isNewOperator = actionCount === 0
  const worldLines = Object.entries(worldState)
    .map(([k, v]) => {
      const desc = METRIC_DESCRIPTIONS[k]
      return `${METRIC_LABELS[k] ?? k}: ${v}% — ${desc ? desc(v) : 'no description available'}`
    })
    .join('\n')

  const traitLines = Object.entries(traits)
    .map(([k, v]) => {
      const base = BASE_TRAITS[k] ?? 50
      const delta = v - base
      const sign = delta > 0 ? '+' : ''
      return `${TRAIT_LABELS[k] ?? k}: started at ${base}%, currently ${v}% (${sign}${delta})`
    })
    .join('\n')

  return groqCall(
    `You are writing an intelligence report for Relay Station 14. This report is read by the operator sitting at the console right now. Write it in second person where the operator is addressed — "you" not "the operator."

CURRENT CITY METRICS (with what they mean in practice):
${worldLines}

OPERATOR PSYCHOLOGICAL PROFILE:
${traitLines}

OPERATIONAL RECORD:
Total decisions made: ${actionCount}
Days at the relay: ${day}
Recent transmissions intercepted: ${news.slice(0, 4).join(' | ')}

${previousAnalysis
    ? `PREVIOUS REPORT TO REFERENCE AND UPDATE:
City then: "${previousAnalysis.cityState ?? ''}"
Operator then: "${previousAnalysis.characterArc ?? ''}"
Note what has materially changed since this report was written. Do not repeat it — update it with what is different now.`
    : isNewOperator
    ? `This is the first report. The operator has not made a single decision yet. They just sat down.`
    : `This is the first report. Establish a baseline from the data available.`
  }

${isNewOperator
    ? `SPECIAL CONTEXT: The operator has made zero decisions. Do NOT fabricate a behavioral history. Do NOT judge choices that have not been made. Instead:
— cityState: Describe the city as it exists RIGHT NOW before this operator has touched anything. Make it vivid. Name districts. Tell them what life looks like at ground level with these exact numbers.
— operatorImpact: Tell them honestly that they have not acted yet. Describe the weight of what is sitting in the queue waiting for them. What do the pending messages collectively represent about the city's state? What kind of decisions are they about to be asked to make?
— trajectory: Based purely on where the city's metrics currently sit and the direction they are trending, what happens if nothing changes? What breaks first? By when?
— characterArc: They have not acted. You cannot judge what you have not seen. Instead, describe who they appear to be based on the traits they came in with — what their starting psychology suggests about how they might approach this work. Be honest about what these trait numbers say about a person, without assuming what they will do.`
    : `TASK: Write an honest, emotionally grounded intelligence report. Use second person. Judge the operator's choices by their actual effects — not their intentions. If the numbers show someone who repeatedly protected themselves at others' expense, say so. If the city has genuinely improved because of specific decisions, say that too — but only if the metrics support it. No softening, no moralizing, no cheerleading.`
  }

Return ONLY valid JSON with no markdown and no code fences:
{
  "cityState": "3-4 sentences. What do these metrics mean for actual people living in this city tonight? Name specific districts or factions that are visible in these numbers. Describe what daily life feels like — sounds, movement, fear, lack of food. Be visceral and grounded.",
  "operatorImpact": "${isNewOperator ? '3 sentences. You have not acted yet. Describe what is waiting for you. What does the queue of unread messages represent, given the city state above? What kind of decisions are coming?' : '3-4 sentences. How did your specific pattern of decisions shape these metrics? What did you prioritize? What did you sacrifice? Reference the metrics that moved most and trace them back to your choices.'}",
  "trajectory": "2-3 sentences. Where is this city going if the current trajectory continues? Name the specific threshold — the metric or the faction or the event — that is most likely to break first, and estimate how many days away it is.",
  "characterArc": "${isNewOperator ? '3 sentences. You have not acted yet. Based only on the traits you brought into this role — your starting psychology — what kind of operator do you seem likely to be? What should you watch out for in yourself? Be honest about what these numbers say without predicting what you will do.' : '3-4 sentences. Who were you when you first sat down — based on your starting traits. Who are you now — based on what your actions actually reveal about your values. Be specific and honest. Describe the gap between what you may have believed about yourself and what your pattern of choices demonstrates.'}",
  "updatedTraits": {
    "empathy": 0,
    "selfishness": 0,
    "manipulation": 0,
    "curiosity": 0,
    "honesty": 0,
    "fear": 0,
    "paranoia": 0
  }
}

For updatedTraits: ${isNewOperator
    ? 'Return the exact same trait values that were given to you. Do not change them — no decisions have been made to justify any shift.'
    : 'Recalculate each trait based on the operator\'s actual behavioral pattern across all their decisions. Adjust each value by 1-12 points from current. Keep all values between 5 and 95. These must reflect real demonstrated behavior — if they repeatedly flag resistance messages, paranoia and manipulation go up, honesty goes down. If they deliver medical messages at personal risk, empathy goes up, selfishness goes down. Do not be gentle. Do not guess at intent — read the pattern.'
  }`,
    1200,
  )
}

const ACTION_CONTEXTS = {
  deliver: 'DELIVERED — forwarded the message to its destination without any changes. The original words arrived exactly as written.',
  ignore: 'IGNORED — did not forward the message. The sender received no response. The intended recipient never knew it existed. The operator moved on.',
  edit: 'EDITED — rewrote the message before forwarding. What arrived at the destination was not what the sender wrote. Their words were changed by someone else\'s hand.',
  reply: 'REPLIED ANONYMOUSLY — sent a reply back to the sender without identifying themselves. The sender received a response but cannot know who sent it or why.',
  flag: 'FLAGGED — reported this message to the authorities. The sender is now on a government list. Whether that matters depends on who they are and what the government is doing with those lists right now.',
  archive: 'ARCHIVED — buried the message in cold storage. No one received it. It will not be seen again unless someone goes looking. The operator chose for it to disappear.',
  delay: 'DELAYED — held the message back deliberately. Whatever it contained has not moved. The sender does not know it is being held. The window for it to matter may be closing.',
}

export const groqGenerateScenario = async (originalMessage, action, draftText, worldState, traits) => {
  const actionContext = ACTION_CONTEXTS[action] ?? action.toUpperCase()
  const editNote = (action === 'edit' || action === 'reply') && draftText
    ? `\nExact text the operator wrote: "${draftText}"`
    : ''

  const raw = await groqCall(
    `You are the consequence engine for Relay Station 14. An operator just made a decision. Your job is to generate the message that arrives as its real, specific, human consequence.

THE OPERATOR'S DECISION:
${actionContext}${editNote}

THE ORIGINAL MESSAGE THAT TRIGGERED THIS:
From: ${originalMessage.sender}, age ${originalMessage.age} (${originalMessage.faction}, ${originalMessage.location})
Subject: ${originalMessage.subject}
Content: "${originalMessage.message}"
Hidden consequence that was always coming: ${originalMessage.hiddenConsequences}
What the operator could not know when they acted: ${originalMessage.truthHint}

THE CITY RIGHT NOW (shapes who can send messages and what they face doing it):
Government Control ${worldState.governmentPower ?? 54}% — ${
    worldState.governmentPower >= 75
      ? 'most civilian channels are being monitored; people communicating outside approved channels risk arrest'
      : worldState.governmentPower >= 50
      ? 'censors are active but inconsistent; some signals slip through'
      : 'government monitoring has degraded; more people are communicating freely but more dangerously'
  }
Resistance Strength ${worldState.resistancePower ?? 37}% — ${
    worldState.resistancePower >= 60
      ? 'the resistance is active, organized, and can coordinate; they will respond to information'
      : worldState.resistancePower >= 35
      ? 'fragmented cells exist but cannot reliably connect with each other'
      : 'the resistance is barely functional; reaching them may accomplish nothing'
  }
Public Fear ${worldState.publicFear ?? 61}% — ${
    worldState.publicFear >= 75
      ? 'people are hiding; most will not act on a message even if they receive it'
      : 'people are scared but still capable of being reached and moved'
  }
Hope Level ${worldState.hopeLevel ?? 29}% — ${
    worldState.hopeLevel <= 20
      ? 'almost none — people are not expecting things to improve; the emotional register of the city is exhaustion'
      : worldState.hopeLevel <= 45
      ? 'fragile — it takes very little to extinguish what remains'
      : 'present — people still believe collective action can change something'
  }
Violence ${worldState.violenceIndex ?? 44}% — ${
    worldState.violenceIndex >= 65
      ? 'active clashes tonight — people are getting hurt in the areas this message concerns'
      : 'tension is high but mostly contained; danger is present but not immediate for most'
  }
Food Supply ${worldState.foodSupply ?? 33}% — ${
    worldState.foodSupply <= 25
      ? 'critical — any interruption of aid delivery has immediate lethal consequences'
      : 'strained but not catastrophic'
  }
Information Control ${worldState.informationControl ?? 72}% — ${
    worldState.informationControl >= 75
      ? 'the state controls most of what people hear; truth is being actively suppressed'
      : 'some honest channels remain open'
  }

OPERATOR BEHAVIORAL PATTERN:
Empathy ${traits.empathy ?? 48}% | Manipulation ${traits.manipulation ?? 16}% | Fear ${traits.fear ?? 43}%
Selfishness ${traits.selfishness ?? 24}% | Paranoia ${traits.paranoia ?? 27}% | Honesty ${traits.honesty ?? 51}%

Generate ONE message that arrives 1-6 days later as a direct consequence of what the operator just did. The message must:
— Come from someone who was CONCRETELY AND SPECIFICALLY affected by this exact decision
— Reference what actually happened — not vaguely, but specifically (names, outcomes, what they saw or heard)
— Carry real emotional weight: the writer should feel like a real person under real pressure — grief, relief, rage, desperation, gratitude, fear, exhaustion — not a neutral report
— Reflect the current world state: if violence is high, crossing a checkpoint is dangerous; if hope is low, the person writing may not believe help is possible
— Be written in a voice that matches who the sender is: a child sounds like a child, a soldier sounds like a soldier, a grieving parent sounds like one

Who can write this consequence message:
- The original sender (reporting what happened after they were heard or ignored)
- The intended recipient (responding to what arrived or what didn't)
- A witness — someone who saw the downstream effect
- A government official acting on what was flagged
- A family member of someone who was affected
- A third party who was changed by what the operator's decision set in motion

Return ONLY valid JSON with no markdown and no code fences:
{
  "sender": "Full realistic name — not generic, not symbolic",
  "age": 35,
  "location": "Specific named district, facility, or street — not just 'unknown'",
  "faction": "Civilian / Resistance Network / The Government / Underground Medics / Black Market / AI Collective / Independent Press / Unknown",
  "emotionalState": "one precise word — grief, relief, fury, exhaustion, hope, terror, numb, resolute",
  "urgency": 60,
  "tone": "one precise word describing the writing voice — fragmented, controlled, hollow, urgent, cold, trembling, steady",
  "category": "personal / political / survival / mystery",
  "subject": "A specific subject line that tells you what this message is about — not vague, not a question, not a game notification. Something a real person would write.",
  "message": "5-8 sentences written in first person. Specific names, places, direct references to what actually happened because of the operator's decision. The writer should feel emotions — let them bleed through the language without becoming melodramatic. This is a real person telling a real story about what the operator's choice did to their life or the lives around them.",
  "history": [
    "One specific past event that directly explains why this person is in this situation right now",
    "A second event that adds texture — what they tried before this, what they lost, what they witnessed",
    "A third event that shows how things deteriorated or changed to bring them to this moment"
  ],
  "hiddenConsequences": "One honest sentence: what will quietly happen in the next few days if the operator ignores or mishandles this message too.",
  "truthHint": "One sentence: something true about this person or situation that cannot be known from reading the message alone — a secret, a context, a danger they haven't named.",
  "worldVector": {
    "governmentPower": 0,
    "resistancePower": 0,
    "publicFear": 0,
    "hopeLevel": 0,
    "violenceIndex": 0,
    "aiInfluence": 0,
    "economicCollapse": 0,
    "foodSupply": 0,
    "informationControl": 0
  }
}

For worldVector: set only the fields this specific scenario actually affects. Use values between -8 and +8. Zero means no effect. Be realistic — most messages affect 2-4 metrics, not all of them.`,
    1100,
  )

  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in scenario response')

  const parsed = JSON.parse(jsonMatch[0])

  return {
    ...parsed,
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    hiddenTruthValue: Math.floor(Math.random() * 35 + 50),
    tags: ['generated', 'consequence', action],
    branches: {},
    spawnedFrom: originalMessage.id,
    _generated: true,
  }
}
