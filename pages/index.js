// File: frontend/pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

// For testing purposes, we use a sample valid public key.
// Replace these with your actual deployed program and account addresses.
const SAMPLE_PUBLIC_KEY = "5eykt4UsFv8P8NJdTREpLw6jkQAN8SK1f4qR4QGgjKcS";

const PROGRAM_ID = new PublicKey(SAMPLE_PUBLIC_KEY);
const NETWORK = "https://api.mainnet-beta.solana.com"; // Mainnet

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [contribution, setContribution] = useState("");

  // Connect to Phantom wallet and initialize the Anchor provider.
  useEffect(() => {
    const initProvider = async () => {
      if (window.solana && window.solana.isPhantom) {
        await window.solana.connect();
        const connection = new Connection(NETWORK);
        // Use the Phantom wallet object directly.
        const wallet = window.solana;
        const provider = new anchor.AnchorProvider(connection, wallet, {
          preflightCommitment: "processed",
        });
        setProvider(provider);
      } else {
        alert("Please install the Phantom wallet extension.");
      }
    };
    initProvider();
  }, []);

  // Function to call your smart contract's "contribute" instruction.
  const handleContribute = async () => {
    if (!provider) return;

    // Sample IDL; replace with your actual IDL when available.
    const idl = {
      version: "0.0.1",
      name: "wavefund_project",
      instructions: [
        {
          name: "contribute",
          accounts: [
            { name: "investor", isMut: true, isSigner: true },
            { name: "pool", isMut: true, isSigner: false },
            { name: "lpMint", isMut: true, isSigner: false },
            { name: "investorTokenAccount", isMut: true, isSigner: false },
            { name: "tokenProgram", isMut: false, isSigner: false }
          ],
          args: [{ name: "amount", type: "u64" }]
        }
      ]
    };

    const program = new anchor.Program(idl, PROGRAM_ID, provider);

    try {
      // Replace these with your actual valid public keys.
      const poolPublicKey = new PublicKey(SAMPLE_PUBLIC_KEY);
      const lpMintPublicKey = new PublicKey(SAMPLE_PUBLIC_KEY);
      const investorTokenAccount = new PublicKey(SAMPLE_PUBLIC_KEY);

      const contributionAmount = new anchor.BN(contribution);

      await program.rpc.contribute(contributionAmount, {
        accounts: {
          investor: provider.wallet.publicKey,
          pool: poolPublicKey,
          lpMint: lpMintPublicKey,
          investorTokenAccount: investorTokenAccount,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        },
      });
      alert("Contribution successful!");
    } catch (err) {
      console.error(err);
      alert("Error during contribution.");
    }
  };

  return (
    <div className="container">
      <Head>
        <title>WaveFund</title>
        <meta name="description" content="Decentralized Crowdfunding Liquidity Protocol on Solana Mainnet" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <main className="main">
        <h1>WaveFund</h1>
        <p>Decentralized Crowdfunding on Solana Mainnet</p>
        <input
          type="number"
          placeholder="Contribution amount (in lamports)"
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
        />
        <button onClick={handleContribute}>Contribute</button>
      </main>
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: #121212;
          color: #e0e0e0;
          font-family: 'Manrope', sans-serif;
        }
        .main {
          padding: 3rem 0;
          text-align: center;
        }
        h1 {
          font-size: 4rem;
          margin: 0;
        }
        p {
          font-size: 1.5rem;
          margin: 1rem 0 2rem;
        }
        input {
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: 2px solid #333;
          background: transparent;
          color: #e0e0e0;
          border-radius: 5px;
          margin-bottom: 1.5rem;
          width: 300px;
          text-align: center;
        }
        button {
          padding: 0.75rem 1.5rem;
          font-size: 1.25rem;
          background-color: #6366f1;
          border: none;
          border-radius: 5px;
          color: #fff;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #4f46e5;
        }
      `}</style>
    </div>
  );
}
