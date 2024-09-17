# ETrip

## Table of Contents

- [About the project](#about-the-project)
  - [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Important Scripts](#important-scripts)
- [Disclaimer](#disclaimer)

## About the project

Etrip is the first website, built by our very own young Ethiopians, that revolutionizes the public transport experience. It provides a modern and very streamlined way of ticket booking for city to city and cross-country journey of passengers.

### Tech Stack

- **Full-stack:** NextJs
- **CSS Framework:** Tailwind CSS
- **Component Library:** [shadcn/ui](https://ui.shadcn.com)
- **ORM:** Prisma
- **Database:** Postgres with [Neon](https://neon.tech)

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

First, make sure that you have the following installed on your machine:

- Node.js (version 18 or later)
- pnpm (run `npm install -g pnpm` if you only have npm and want to install pnpm)

### Installation

1. Clone the repository to your local machine.
2. Run `pnpm install` in the project directory to install the necessary dependencies.
3. Create a .env file and setup the database connection url.
4. Run `pnpx prisma generate` to generate prisma client
5. Start the development server by running `pnpm dev`.
6. Finally, visit the local port the site is running on.

### Important Scripts

```sh
pnpm dev  # Start the dev environment

pnpm build # Build the NextJS project

```

## Disclaimer

This website and its associated codebase are the intellectual property of [Bitophiyaa](https://bitophiyaa.com). All rights reserved. The code, design, and content of this website are not open-source and may not be reproduced, distributed, or used for any purpose without explicit permission from [Bitophiyaa](https://bitophiyaa.com).
