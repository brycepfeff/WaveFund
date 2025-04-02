// File: wavefund_program/programs/wavefund_program/src/lib.rs
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

declare_id!("WaveFund1111111111111111111111111111111111111");

#[program]
pub mod wavefund_project {
    use super::*;

    /// Investors contribute funds to the pool.
    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        // Increase the total funds by the contributed amount.
        let pool = &mut ctx.accounts.pool;
        pool.total_funds = pool.total_funds.checked_add(amount).unwrap();
        pool.contributors += 1;

        // Mint LP tokens (1:1 ratio for simplicity).
        let cpi_accounts = MintTo {
            mint: ctx.accounts.lp_mint.to_account_info(),
            to: ctx.accounts.investor_token_account.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::mint_to(cpi_ctx, amount)?;

        Ok(())
    }
}

/// Accounts for the contribute instruction.
#[derive(Accounts)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub investor: Signer<'info>,
    /// CHECK: This account will hold the total funds.
    #[account(mut)]
    pub pool: Account<'info, FundingPool>,
    /// The LP token mint account.
    #[account(mut)]
    pub lp_mint: Account<'info, Mint>,
    /// The token account to receive LP tokens.
    #[account(mut)]
    pub investor_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

/// The state of the funding pool.
#[account]
pub struct FundingPool {
    pub total_funds: u64,
    pub contributors: u64,
}
