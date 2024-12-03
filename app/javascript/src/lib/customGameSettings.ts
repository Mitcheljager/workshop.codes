export function constructCustomGameSettings(customGameSettings: object, heroes: object[]): object {
  const settings = { ...customGameSettings }
  // @ts-ignore
  const settingsHeroes = settings.heroes.values

  // @ts-ignore
  heroes.forEach(({ name }: { name: string }) => {
    if (!(name in settingsHeroes)) return

    // @ts-ignore
    Object.entries(settingsHeroes.General.values).forEach(([key, item]: [key: string, item: object]) => {
      // @ts-ignore
      if (item.include?.includes(name) || !item.include) settingsHeroes[name].values[key] = item
    })

    settingsHeroes.each.forEach((item: object) => {
      // @ts-ignore
      const key = item.keys?.[name]
      if (key) settingsHeroes[name].values[key] = item
    })
  })

  return settings
}
