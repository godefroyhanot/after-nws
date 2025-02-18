import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    // Créer l'utilisateur par défaut
    const defaultUser = await prisma.user.upsert({
        where: {
            email: 'franky@normandiewebschool.fr',
        },
        update: {},
        create: {
            email: 'franky@normandiewebschool.fr',
            name: 'Franky',
            isVerified: true,
            passwordHash: await hash('defaultPassword123', 10), // Mot de passe par défaut
        },
    })

    console.log('Utilisateur par défaut créé:', defaultUser)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
