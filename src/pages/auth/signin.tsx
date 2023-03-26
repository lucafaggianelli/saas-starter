import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import {
  ClientSafeProvider,
  getCsrfToken,
  getProviders,
  signIn,
} from 'next-auth/react'
import { ReactElement, useEffect } from 'react'
import { Box } from '@mui/system'
import {
  Button,
  ButtonProps,
  colors,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  styled,
  TextField,
  Typography,
} from '@mui/material'
import { Google, Send } from '@mui/icons-material'

const LUT_PROVIDERS_ICON: any = {
  google: <Google />,
}

const ColorButton = styled(Button)<ButtonProps>(({ theme }) => {
  return {
    [theme.breakpoints.down('md')]: {
      color: theme.palette.getContrastText(colors.common.white),
      backgroundColor: colors.common.white,
      '&:hover': {
        backgroundColor: colors.grey[200],
      },
    },
  }
})

interface ProviderFormProps {
  csrfToken: string
  provider: ClientSafeProvider
}

const ProviderForm: React.FC<ProviderFormProps> = ({ provider, csrfToken }) => {
  if (provider.type === 'oauth') {
    return (
      <ColorButton
        variant="contained"
        disableElevation
        size="large"
        startIcon={LUT_PROVIDERS_ICON[provider.id]}
        onClick={() => signIn(provider.id, { callbackUrl: '/' })}
      >
        Login with {provider.name}
      </ColorButton>
    )
  } else if (provider.type === 'email') {
    return (
      <form action={provider.signinUrl} method="POST">
        <Divider variant="middle" sx={{ my: 4 }} />

        <Box mx={2} mb={2} color="GrayText">
          Or login via email, we'll send you a clickable link.
        </Box>

        <input type="hidden" name="csrfToken" value={csrfToken} />

        <TextField
          id={`input-email-for-${provider.id}-provider`}
          label="Email address"
          type="email"
          name="email"
          placeholder="email@example.com"
          required
          fullWidth
          variant="filled"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit">
                  <Send />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </form>
    )
  }

  return <div>unsupported provider {provider.type}</div>
}

export default function SignIn({
  providers = [],
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <Grid
      container
      height="100%"
      spacing={0}
      sx={{
        backgroundImage: {
          xs: 'linear-gradient(45deg, #29b6f6, #0e2c79)',
          sm: 'linear-gradient(45deg, #29b6f6, #0e2c79)',
          md: 'none',
        },
        backgroundSize: 'cover',
      }}
    >
      <Grid
        item
        xs={12}
        md={4}
        lg={4}
        position="relative"
        paddingX={6}
        paddingY={12}
        height="100%"
        boxShadow={12}
      >
        <Box
          display="flex"
          flexDirection="column"
          alignContent="center"
          justifyContent={{
            xs: 'space-between',
            sm: 'space-between',
            md: 'center',
          }}
          height="100%"
        >
          <Typography
            variant="h3"
            component="h1"
            color={{ xs: 'white', sm: 'white', md: 'initial' }}
            marginBottom={8}
          >
            Welcome
          </Typography>

          {providers.map((provider) => (
            <Box
              key={provider.name}
              display="flex"
              alignContent="center"
              justifyContent="center"
            >
              <ProviderForm provider={provider} csrfToken={csrfToken} />
            </Box>
          ))}
        </Box>
      </Grid>

      <Grid
        item
        xs={12}
        md={8}
        lg={8}
        style={{
          fontSize: 0,
          backgroundImage: 'linear-gradient(45deg, #29b6f6, #0e2c79)',
        }}
        display={{ xs: 'none', sm: 'none', md: 'block' }}
      ></Grid>
    </Grid>
  )
}

const Layout = (page: ReactElement) => {
  useEffect(() => {
    const appHeight = () => {
      const doc = document.documentElement
      doc.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    window.addEventListener('resize', appHeight)
    appHeight()

    return () => {
      window.removeEventListener('resize', appHeight)
    }
  })

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'var(--app-height)',
      }}
    >
      {page}
    </Box>
  )
}

SignIn.getLayout = Layout

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // const session = await getServerSession(context.req, context.res, authOptions)

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  // const url = new URL(context.req.url!, `http://${context.req.headers.host}`)
  // if (session) {
  //   // return { redirect: { destination: '/' } }
  // }

  const providers = await getProviders()
  // Sort providers so email is the last
  const sortedProviders = Object.values(providers || {}).sort((a, b) =>
    a.type === b.type ? 0 : a.type === 'email' ? 1 : -1,
  )

  const csrfToken = await getCsrfToken(context)

  if (!csrfToken) {
    throw new Error('Cant obtain a CSRF token')
  }

  return {
    props: { providers: sortedProviders, csrfToken },
  }
}
