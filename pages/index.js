// File: frontend/pages/index.js
import { useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

// Sample valid public key (for testing only).
// Replace these with your actual deployed program and account addresses.
const PROGRAM_ID = new PublicKey("5eykt4UsFv8P8NJdTREpLw6jkQAN8SK1f4qR4QGgjKcS");
const NETWORK = "https://api.devnet.solana.com";

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [contribution, setContribution] = useState("");

  // Connect to the Phantom wallet and initialize the Anchor provider.
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

  // Function to call the contribute instruction on your smart contract.
  const handleContribute = async () => {
    if (!provider) return;

    // Sample IDL; replace with your actual generated IDL when available.
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
      // Replace these placeholders with your actual valid public keys.
      const poolPublicKey = new PublicKey("5eykt4UsFv8P8NJdTREpLw6jkQAN8SK1f4qR4QGgjKcS");
      const lpMintPublicKey = new PublicKey("5eykt4UsFv8P8NJdTREpLw6jkQAN8SK1f4qR4QGgjKcS");
      const investorTokenAccount = new PublicKey("5eykt4UsFv8P8NJdTREpLw6jkQAN8SK1f4qR4QGgjKcS");

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
    <div style={{ padding: "2rem" }}>
      <h1>WaveFund</h1>
      <input
        type="text"
        placeholder="Contribution amount (in lamports)"
        value={contribution}
        onChange={(e) => setContribution(e.target.value)}
      />
      <button onClick={handleContribute}>Contribute</button>
    </div>
  );
}
