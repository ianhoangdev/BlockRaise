# BlockRaise

## Overview

BlockRaise is a decentralized crowdfunding platform built using Ethereum smart contracts, allowing users to contribute and raise funds in a trustless and transparent manner. The application is designed with a seamless, responsive user interface and integrated with the Ethereum blockchain for secure transactions. Hosted on AWS using Docker and EC2, BlockRaise reduces hosting costs and provides a scalable solution for future growth.

## Features

- **Smart Contract Development:** Ethereum-based Solidity smart contracts enabling secure, transparent, and trustless crowdfunding campaigns.
- **Optimized UI & Blockchain Interactions:** Responsive frontend built with Next.js and TypeScript, integrating Ethers.js for seamless blockchain transactions.
- **Cloud Deployment:** Deployed on AWS using Docker and EC2, reducing hosting costs by 20%.
- **Crowdfunding Workflow:** Users can create campaigns, contribute to others' campaigns, and track progress in real-time.

## Technologies Used
- **Solidity:** Smart contract development on the Ethereum blockchain to handle crowdfunding functionality.
- **Next.js:** Framework for building the frontend with a fast, responsive UI.
- **TypeScript:** Strongly typed JavaScript for better maintainability and code quality.
- **TailwindCSS:** Utility-first CSS framework for styling and creating a visually appealing interface.
- **Node.js:** Backend runtime for handling application logic and interactions with the blockchain.
- **Docker:** Containerization of the app for efficient deployment and management.
- **AWS (Amazon Web Services):** Cloud hosting and deployment on Amazon EC2 to ensure reliability and scalability.

## Setup & Installation

**Prerequisites**
- Node.js
- Docker
- AWS account (for deployment)


**Installation**

1. Clone the repository:

`git clone git@github.com:ianhoangdev/BlockRaise.git`

2. Install dependencies:

`npm install`

3. Run the project locally:

`npm run dev` and open the app in your browser at `http://localhost:3000`

4. For Docker deployment, build and run the Docker container:

`docker build -t block-raise .
docker run -p 3000:3000 block-raise`

## Deployment on AWS
1. Build and package the Docker image.
2. Deploy the Docker container on AWS EC2.

## Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License.

