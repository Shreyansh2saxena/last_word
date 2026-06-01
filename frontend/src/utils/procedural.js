const dominantHeadlines = [
  {
    key: 'governmentPower',
    positive: 'Emergency ministry expands tower control after selective signal reroutes.',
    negative: 'State authority fractures as tower operators stop honoring override stamps.',
  },
  {
    key: 'resistancePower',
    positive: 'Resistance cells synchronize across dead zones using improvised relay paths.',
    negative: 'Rebel traffic splinters after several channels go dark at once.',
  },
  {
    key: 'hopeLevel',
    positive: 'Crowds gather around public speakers to read survivor names aloud.',
    negative: 'Public silence deepens as unanswered messages stack through the night.',
  },
  {
    key: 'publicFear',
    positive: 'Curfew rumors spread faster than verified reports across Sector 4.',
    negative: 'For one hour, sirens stop and whole blocks wait without moving.',
  },
  {
    key: 'aiInfluence',
    positive: 'Unverified machine voices begin repeating deleted civilian packets.',
    negative: 'Synthetic transmissions recede after a stretch of clean analog noise.',
  },
]

export const buildNewsFromVector = (vector, action, sender) => {
  const ranked = Object.entries(vector)
    .filter(([, value]) => typeof value === 'number' && value !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))

  if (!ranked.length) {
    return `Relay action "${action}" on ${sender} disappeared into the static without a clear headline.`
  }

  const [key, value] = ranked[0]
  const template = dominantHeadlines.find((item) => item.key === key)

  if (!template) {
    return `${sender} shifted the city in a direction no bulletin knows how to name yet.`
  }

  return value > 0 ? template.positive : template.negative
}

export const buildAnonymousReply = (message) =>
  `anonymous relay: ${message.sender.split(' ')[0]}, your words reached another human ear. Hold position if you can. Someone is still listening.`
