import { RootContext } from '.'

export function boilerplateReactNativeInit(context: RootContext) {
  return async (projectName: string, withStore: boolean) => {
    const {
      system,
      print,
      filesystem,
      npmAddDevPackages,
      generateFiles,
      patching,
      strings,
      storeCreateReducer,
    } = context

    let hasReactNative

    try {
      hasReactNative = !!(await system.run('npm info react-native'))
    } catch (error) {
      hasReactNative = false
    }

    if (!hasReactNative) {
      print.error(
        `The ${print.colors.yellow(
          'react-native-cli',
        )} was not found. We need this to be installed to generate the boilerplate.`,
      )
      return process.exit(0)
    }

    const spinner = print.spin(`Creating ${projectName}...`)

    await system.run(`react-native init ${projectName}`)

    process.chdir(projectName)

    await npmAddDevPackages([
      'typescript',
      'react-native-typescript-transformer',
      '@types/react',
      '@types/react-native',
      'tslint',
      'tslint-config-prettier',
      'tslint-react',
    ])

    if (withStore) {
      await storeCreateReducer('app', ['foo', 'bar'])
    }

    await filesystem.remove('App.js')
    await patching.update('package.json', pkg => {
      pkg.name = strings.kebabCase(projectName)
      pkg.anoa = {
        preset: 'react-native-init',
        withStore
      }
      return pkg
    })

    await generateFiles('shared', ['tslint.json', 'tsconfig.json', '.jshintrc', '.prettierrc'])

    if (withStore) {
      await generateFiles('rni/withStore/src/', ['App.tsx'], 'src/')
    } else {
      await generateFiles('basic', ['src/App.tsx'])
    }

    await generateFiles('rni', ['index.js', 'rn-cli.config.js'])

    spinner.succeed(`Yay! The ${print.colors.green(projectName)} project is ready!`)
  }
}
