import inquirer from "inquirer";
import { z } from "zod";
import { createConsumer } from "../../model/consumer";
import { consumerDataDemo } from "./demo-data";

export async function promptForConsumerData()  {
  const { demoData } = await inquirer.prompt({
    type: "confirm",
    message: "Use demo data?",
    name: "demoData"
  }); 

  const consumerData = demoData 
    ? consumerDataDemo
    : await getConsumerDataInteractive();

  return createConsumer(consumerData); 
}


async function getConsumerDataInteractive() {
  const { adressType } = await inquirer.prompt({
    type: "list",
    message: "Adress Type",
    name: "adressType",
    choices: ["Business", "Private"]
  });

  const namePart = await promptForNamePart(adressType);

  const addressInfo = await promptForAddress();

  const { email } = await inquirer.prompt({
    type: "input",
    name: "email",
    message: "E-Mail",
    validate: (input) => {
      const result = z.string().email().safeParse(input);
      if (!result.success) {
        return `E-Mail invalid`;
      }
      return true;
    }
  })

  const consumerData = {
    email,
    address: {
      ...namePart,
      ...addressInfo
    }
  };

  return consumerData;
}

async function promptForNamePart(adressType: string) {
  if (adressType === "Business") {
    const { companyName } = await inquirer.prompt({
      message: "Company Name",
      name: "companyName",
      type: "input",
      validate: validateNonEmpty("Company Name")
    });

    return { companyName }
  } 

  const {
    firstName,
    lastName
  } = await inquirer.prompt([
    {
      name: "firstName",
      message: "First Name",
      type: "input",
    },
    {
      name: "lastName",
      message: "Last Name",
      type: "input",
      validate: validateNonEmpty("Last Name")
    }
  ]);

  return {  
    firstName, 
    lastName
  };
}

async function promptForAddress() {
  const answers = await inquirer.prompt([
    {
      "type": "list",
      "name": "country",
      "message": "Country",
      "choices": [
        "DE", "CH", "AT"
      ]
    },
    {
      "type": "input",
      "name": "city",
      "message": "City",
      validate: validateNonEmpty("City")
    },
    {
      "type": "input",
      "name": "postalCode",
      "message": "Postal Code",
      validate: validateNonEmpty("Postal Code")
    },
    {
      "type": "input",
      "name": "street",
      "message": "Street",
      validate: validateNonEmpty("Street")
    },
    {
      "type": "input",
      "name": "houseNumber",
      "message": "House Number",
      validate: validateNonEmpty("House Number")
    },
  ]);

  const adressShape = z.object({
    country: z.string(),
    city: z.string(),
    postalCode: z.string(),
    street: z.string(),
    houseNumber: z.string()
  });

  return adressShape.parse(answers);
}

function validateNonEmpty(fieldName: string): (input: string) => boolean|string {
  return (input: string) => {
    const parseResult = z.string().min(1).safeParse(input);
    if (!parseResult.success) {
      return `${fieldName} can't be empty`;
    }
    return true;
  }
}