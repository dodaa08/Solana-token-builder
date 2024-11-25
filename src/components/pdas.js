
import { PublicKey } from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token';


// Replace these with your actual values
const userAddress = new PublicKey('oYMZwKrxxCT74hkUoRXyqissSyXWvRPUeWsbHhsKPhC');
const tokenMintAddress = new PublicKey('6NeR2StEEb6CP75Gsd7ydbiAkabdriMdixPmC2U9hcJs');

// Derive the associated token address
const getAssociatedTokenAddress = (mintAddress, ownerAddress) => {
    return PublicKey.findProgramAddressSync(
        [
            ownerAddress.toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            mintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    );
};


let foundPDA = null; // To store the valid PDA
let validBump = null;
for(let i = 255; i >=1 ; i--) {
    try {
        // Attempt to create a PDA with the current bump seed
        const PDA = PublicKey.createProgramAddressSync(
            [
                userAddress.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                tokenMintAddress.toBuffer(),
                Buffer.from([i]), // Current bump seed
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        
        foundPDA = PDA; // If successful, store the PDA
        validBump = i; // Store the bump seed
        console.log(`Valid PDA found: ${foundPDA.toBase58()}, Bump Seed: ${validBump}`);
        break; // Exit the loop once a valid PDA is found
    } catch (error) {
        // If the error is related to the address being off the curve, we exit
        if (error.message.includes('Invalid public key input')) {
            console.log(`Generated PDA with bump seed ${i} is off the curve, stopping search.`);
            break; // Exit the loop as we know no further valid PDA will be found
        }
        // Otherwise, continue to the next bump seed
        continue;
    }
   
}


   





const [associatedTokenAddress, bump] = getAssociatedTokenAddress(tokenMintAddress, userAddress);
console.log(`Associated Token Address: ${associatedTokenAddress.toBase58()}, bump: ${bump}`);

