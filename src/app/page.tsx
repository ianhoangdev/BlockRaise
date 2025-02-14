"use client"
import { useReadContract } from "thirdweb/react"
import { client } from "./client"
import { sepolia } from "thirdweb/chains"
import { getContract } from "thirdweb"
import { CampaignCard } from "./components/CampaignCard"
import { Space_Grotesk, Inter } from "next/font/google"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] })
const inter = Inter({ subsets: ["latin"] })

export default function Home() {
  const CROWDFUNDING_FACTORY = process.env.NEXT_PUBLIC_CROWDFUNDING_FACTORY

  if (!CROWDFUNDING_FACTORY) {
    throw new Error("CROWDFUNDING_FACTORY environment variable is not set")
  }

  const contract = getContract({
    client: client,
    chain: sepolia,
    address: CROWDFUNDING_FACTORY,
  })

  console.log("contract:", contract)
  console.log("factory:", CROWDFUNDING_FACTORY)

  const { data: campaigns, isPending: isLoadingCampaigns } = useReadContract({
    contract,
    method:
      "function getAllCampaigns() view returns ((address campaignAddress, address owner, string name, uint256 creationTime)[])",
    params: [],
  })

  console.log("campaigns", campaigns)

  return (
    <main className="mx-auto max-w-7xl px-4 mt-4 sm:px-6 lg:px-8">
      <div className="py-10">
        <h1 className="text-4xl text-center mb-6">Bring your project to life</h1>
        <h2 className={`${spaceGrotesk.className} text-4xl font-bold mb-4`}>Campaigns:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingCampaigns ? (
            <p>Loading campaigns...</p>
          ) : campaigns && campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <CampaignCard key={campaign.campaignAddress} campaignAddress={campaign.campaignAddress} />
            ))
          ) : (
            <p>No Campaigns</p>
          )}
        </div>
      </div>
    </main>
  )
}

