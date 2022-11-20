import inquirer from 'inquirer'
import { z } from 'zod'
import { Order } from '../../model/order'
import { articleCatalogDemo } from './demo-data'

export async function promptForOrderLines () {
  const orderLines: Order['orderLineItems'] = []

  const catalog = [...articleCatalogDemo].sort(new Intl.Collator('en').compare)

  while (true) {
    const { title, qty, another } = await inquirer.prompt([
      {
        type: 'list',
        choices: catalog,
        name: 'title',
        message: 'Select Article'
      },
      {
        type: 'number',
        name: 'qty',
        message: (answers) => `[${String(answers.title)}]: Quantity`,
        validate: (input) => {
          const result = z.number().min(1).safeParse(input)
          if (!result.success) {
            return 'Quantity must be at least 1'
          }
          return true
        }
      },
      {
        type: 'confirm',
        name: 'another',
        message: 'Add another one?',
        default: false
      }
    ])

    const tenantArticleId = String(
      catalog.findIndex((catalogItem) => catalogItem === title)
    )

    orderLines.push({
      quantity: qty,
      article: {
        tenantArticleId,
        title
      }
    })

    if (another === false) {
      break
    }
  }

  console.log('Summary:')
  console.table(orderLines)

  return orderLines
}
