import inquirer from 'inquirer'

export async function promptForPickJob () {
  const { doPick } = await inquirer.prompt({
    type: 'confirm',
    message: 'Perform perfect pick now?',
    name: 'doPick'
  })

  return doPick === true
}
