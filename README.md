# Lumina

Plataforma EAD em Next.js, TypeScript, Prisma e PostgreSQL.

## Setup do projeto

Copie `.env.example` para `.env`, ajuste `DATABASE_URL` e `SESSION_SECRET`, depois execute `npm install`, `npm run db:generate`, `npm run db:push`, `npm run db:seed` e `npm run dev`.

## API implementada

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- `GET /api/courses`, `GET /api/courses/:id`, `POST /api/courses`
- `POST /api/courses/:id/enroll`, `GET /api/enrollments`
- `POST /api/lessons/:id/progress`
- `PUT/DELETE /api/modules/:id`, `PUT/DELETE /api/lessons/:id`
- `GET /api/auth/me`, `GET /api/dashboard/student`
- `GET /api/dashboard/teacher`

As sessões usam cookie HttpOnly assinado. O schema em `prisma/schema.prisma` contempla módulos, aulas, materiais, avaliações, certificados, notificações e o futuro papel de administrador.

## E-mail de recuperação

O envio usa Nodemailer via SMTP. Configure `APP_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` e `SMTP_FROM` no `.env`. Em desenvolvimento, sem SMTP configurado, a API retorna um link temporário para teste local; em produção, o envio SMTP é obrigatório.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
