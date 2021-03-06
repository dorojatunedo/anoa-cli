import { RootContext } from '../libs'

export default {
  name: 'data',
  alias: ['d'],
  description: 'Data / storage generator',
  run: async (context: RootContext) => {
    const {
      parameters: { first, second },
      prompt,
      print,
      data,
      strings: { kebabCase, pascalCase },
    } = context

    const taskCreateModel = 'Create new data model'
    const taskCreateProvider = 'Create new data provider'

    let task = undefined

    switch (first) {
      case 'm':
        task = taskCreateModel
        break

      case 'p':
        task = taskCreateProvider
        break
    }

    if (!task) {
      const { pickTask } = await prompt.ask([
        {
          name: 'pickTask',
          message: 'What would you like to do with store?',
          type: 'list',
          choices: [taskCreateModel, taskCreateProvider],
        },
      ])
      task = pickTask
    }

    if (!task) {
      print.warning('- Nothing to loose -')
      process.exit(0)
      return
    }

    if (task === taskCreateModel) {
      let name = second
      if (!name) {
        name = (await prompt.ask([
          {
            type: 'input',
            name: 'name',
            message: 'Model name',
          },
        ])).name
      }

      if (!name) {
        print.error('Name is required')
        process.exit(0)
        return
      }

      const rnsqlitestorageInstalled = await data.createModel(name)

      print.success(
        `A new model named ${print.colors.magenta(
          pascalCase(name),
        )} was successfully created on ${print.colors.yellow(
          `src/data/models/${kebabCase(name)}.ts`,
        )}`,
      )

      if (rnsqlitestorageInstalled) {
        print.success(
          print.colors.white(
            `A ${print.colors.magenta(
              'react-native-sqlite-storage',
            )} was just installed please refer to ${print.colors.yellow(
              'https://github.com/andpor/react-native-sqlite-storage',
            )} to link this module into android or ios module.`,
          ),
        )
      }
    } else if (task === taskCreateProvider) {
      let name = second
      if (!name) {
        name = (await prompt.ask([
          {
            type: 'input',
            name: 'name',
            message: 'Provider name',
          },
        ])).name
      }

      if (!name) {
        print.error('Name is required')
        process.exit(0)
        return
      }

      await data.createProvider(name)

      print.success(
        `A new data provider named ${print.colors.magenta(
          pascalCase(name),
        )} was successfully created on ${print.colors.yellow(
          `src/data/providers/${kebabCase(name)}.ts`,
        )}`,
      )
    }
  },
}
