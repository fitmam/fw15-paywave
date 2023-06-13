import Footer from '@/components/footer'
import Header from '@/components/header'
import PinInput from '@/components/pin-input'
import Sidebar from '@/components/sidebar'
import cookieConfig from '@/helpers/cookie-config'
import http from '@/helpers/http'
import { useEffect, useState } from 'react'
import { withIronSessionSsr } from 'iron-session/next'
import { useDispatch } from 'react-redux'
import { getProfileAction } from '@/redux/actions/profile'
import { useRouter } from 'next/router'

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  const token = req.session.token || null
  return {
    props: {
      token,
    },
  }
}, cookieConfig)

export default function ChangePin({ token }) {
  const [pin, setPin] = useState('')
  const [errormessage, seterrormessage] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()
  const [loading, setLoading] = useState('')

  useEffect(() => {
    dispatch(getProfileAction(token))
  }, [dispatch, token])

  if (errormessage) {
    setTimeout(() => {
      seterrormessage(false)
    }, 3000)
  }

  async function doSubmit(e) {
    e.preventDefault()
    try {
      setLoading(true)
      const oldPin = pin
      let newPin
      let confirmPin
      const form = new URLSearchParams({
        oldPin,
        newPin,
        confirmPin,
      }).toString()
      const { data } = await http(token).patch('/profile/change-pin', form)
      setLoading(false)
      if (data) {
        router.push('/profile/change-newpin')
      }
    } catch (err) {
      const message = err.response?.data?.message
      if (message === 'profile_change_pin_wrong_old') {
        seterrormessage('Wrong old pin')
      }
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className="flex gap-10 w-full h-[800px] py-10 px-20">
        <Sidebar />
        <div className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-10 w-full rounded-2xl shadow-2xl h-full p-10">
            <div className="flex flex-col gap-5 w-2/6">
              <div className="font-bold text-2xl">Change Pin</div>
              <div>
                Enter your current 6 digits PayWave PIN below to continue to the
                next steps.
              </div>
            </div>
            <div className="flex w-full mx-auto mt-10 flex-col justify-center items-center gap-8 ">
              {errormessage && (
                <div className="alert alert-error max-w-md text-lg text-white">
                  {errormessage}
                </div>
              )}
              <div className="font-bold text-lg">Enter your current pin</div>
              <form
                onSubmit={doSubmit}
                className="w-full flex flex-col gap-10 items-center justify-center"
              >
                <PinInput onChangePin={setPin} />
                <button
                  type="submit"
                  className="btn btn-primary w-1/2 normal-case max-w-md text-white"
                >
                  {loading && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                  {!loading && 'Change PIN'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
