import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components'
import * as React from 'react'

interface DeveloperNotificationEmailProps {
  url: string
}

export const DeveloperNotificationEmail: React.FC<
  DeveloperNotificationEmailProps
> = ({ url = 'https://www.nextjsjob.com' }) => {
  const currentYear = new Date().getFullYear()

  return (
    <Html>
      <Head />
      <Preview>
        NextJS Job Board is now live! Find your dream Next.js job today.
      </Preview>
      <Tailwind>
        <Body className="bg-[#f2f2f2] font-sans">
          <Container className="mx-auto py-5 px-4 max-w-xl">
            <Link href={url}>
              <Img
                src={`${url}/logo.png`}
                width="250"
                height="150"
                alt="NextJS Job Board"
                className="mx-auto mb-5"
              />
            </Link>
            <Heading className="text-3xl font-bold text-center text-black mb-6">
              The NextJS Job Board is now live!
            </Heading>
            <Text className="text-lg text-[#191919} mb-4">Hello there,</Text>
            <Text className="text-lg text-{#191919} mb-4">
              {`Great news! We are now live and ready for action. As someone who signed up to be notified, you're among the first to know.`}
            </Text>
            <Text className="text-lg text-{#191919} mb-4">
              {`Exciting Next.js job opportunities await you. Whether you're looking for your next big career move or just curious about what's out there, now's the perfect time to explore.`}
            </Text>
            <Section className="text-center my-8">
              <Link
                href={`${url}/jobs`}
                className="bg-[#24AD49] text-white font-bold py-3 px-6 rounded-md text-center no-underline inline-block hover:bg-[#24AD49]"
              >
                Explore Jobs Now
              </Link>
            </Section>
            <Text className="text-lg text-[#191919} mb-4">
              Happy job hunting!
            </Text>
            <Text className="text-lg text-{#191919} mb-4">
              Best regards,
              <br />
              The NextJS Job Board Team
            </Text>
            <Hr className="border-[#24AD49} my-6" />
            <Text className="text-sm text-black text-center">
              © {currentYear} NextJS Job Board. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default DeveloperNotificationEmail
