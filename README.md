This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Known bugs
* Sometimes, when you do weird mouse movements, you can spawn another copy of a piece
* (HARD TO REPLICATE) If you have multiple pieces that can capture, all of it can capture,
which is against the game rules theoretically, since you can only capture with one piece,
in which, after that selected piece ended its capture streak, the move will end. Admin note: As of
August 6, 2023 - This has been fixed.
* Sometimes, when you move and capture is detected, it will will still be your move



## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
