import Image from 'next/image'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import Footer from '@/components/footer'
import Head from 'next/head'
import PinModal from '@/components/pin-modal'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { withIronSessionSsr } from 'iron-session/next'
import { getProfileAction } from '@/redux/actions/profile'
import cookieConfig from '@/helpers/cookie-config'
import { useRouter } from 'next/router'
import { setMessage } from '@/redux/reducers/message'
import { FiUser } from 'react-icons/fi'
import moment from 'moment'

export const getServerSideProps = withIronSessionSsr(async ({ req }) => {
  const token = req.session.token || null
  return {
    props: {
      token,
    },
  }
}, cookieConfig)

export default function Confirmation({ token }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const recipient = useSelector((state) => state.transfer.user)
  const amount = useSelector((state) => state.transfer.amount)
  const notes = useSelector((state) => state.transfer.notes)
  const profile = useSelector((state) => state.profile.data)

  useEffect(() => {
    dispatch(getProfileAction(token))
    if (!token) {
      router.push('/auth/login')
      dispatch(setMessage('You have to login first !'))
    }

    if (!recipient) {
      router.push('/dashboard')
      dispatch(setMessage('You have to make transfer first !'))
    }
  }, [dispatch, token, router, recipient])

  return (
    <>
      <Head>
        <title>Confirmation</title>
      </Head>
      <Header />
      <div className="flex gap-10 w-full h-[800px] lg:py-10 lg:px-20">
        <Sidebar />
        <div className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-10 w-full rounded-2xl shadow-2xl h-full p-5 lg:p-10">
            <div className="font-bold text-2xl">Transfer To</div>
            <div className="flex gap-5 items-center w-full h-[110px] shadow-md rounded-lg px-10 p-5">
              {!recipient.picture && (
                <div className="w-12 h-12 bg-white border rounded flex justify-center items-center">
                  <FiUser size={35} />
                </div>
              )}
              {recipient.picture && (
                <div className="w-[52px] h-[52px] rounded-lg overflow-hidden">
                  <Image
                    src={recipient.picture}
                    alt={recipient.fullName || recipient.email}
                    width={60}
                    height={60}
                  ></Image>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="font-bold">{recipient.fullName}</div>
                <div className="text-gray-400">{recipient.email}</div>
              </div>
            </div>
            <div className="font-bold text-xl">Details</div>
            <div className="flex flex-col gap-5 w-full h-[500px] overflow-scroll">
              <div className="flex flex-col gap-2 border-gray-200 border-2 w-full h-[110px] shadow-md rounded-lg px-10 p-5">
                <div>Amount</div>
                <div className="font-bold text-xl">Rp.{amount}</div>
              </div>
              <div className="flex flex-col gap-2 border-gray-200 border-2 w-full h-[110px] shadow-md rounded-lg px-10 p-5">
                <div>Balance Left</div>
                <div className="font-bold text-xl">
                  Rp.{amount - profile.balance}
                </div>
              </div>
              <div className="flex flex-col gap-2 border-gray-200 border-2 w-full h-[110px] shadow-md rounded-lg px-10 p-5">
                <div>Date & Time</div>
                <div className="font-bold text-xl">
                  {moment().format('MMMM Do YYYY, h:mm a')}
                </div>
              </div>
              <div className="flex flex-col gap-2 border-gray-200 border-2 w-full h-[110px] shadow-md rounded-lg px-10 p-5">
                <div>Notes</div>
                <div className="font-bold text-xl">{notes}</div>
              </div>
            </div>
            <div className="flex w-full justify-end">
              <label
                htmlFor="pinModal"
                className="btn btn-primary normal-case text-white"
              >
                Continue
              </label>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <input type="checkbox" id="pinModal" className="modal-toggle" />
      <PinModal userToken={token} />
    </>
  )
}
