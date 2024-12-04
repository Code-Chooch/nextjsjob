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

interface EmployerNotificationEmailProps {
  url: string
}

export const EmployerNotificationEmail: React.FC<
  EmployerNotificationEmailProps
> = ({ url = 'https://www.nextjsjob.com' }) => {
  const currentYear = new Date().getFullYear()

  return (
    <Html>
      <Head />
      <Preview>
        NextJS Job Board is now live! Post your Next.js job openings today.
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
            <Text className="text-lg text-[#191919] mb-4">Hello there,</Text>
            <Text className="text-lg text-[#191919} mb-4">
              {`Great news! We are now live and ready for action. As someone who signed up to be notified, you're among the first to know.`}
            </Text>
            <Text className="text-lg text-[#191919} mb-4">
              {`It's time to connect with top Next.js talent. Our platform is now ready for you to post your job openings and reach skilled developers in the Next.js community.`}
            </Text>
            <Section className="text-center my-8">
              <Link
                href={`${url}/job/new`}
                className="bg-[#24AD49] text-white font-bold py-3 px-6 rounded-md text-center no-underline inline-block hover:bg-[#24AD49]"
              >
                Post a Job
              </Link>
            </Section>
            <Text className="text-lg text-[#191919} mb-4">
              {`We're excited to help you find your next great team member!`}
            </Text>
            <Text className="text-lg text-[#191919} mb-4">
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

export default EmployerNotificationEmail
