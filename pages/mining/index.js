import * as React from 'react'
import Head from '@containers/head'
import { MiningPage } from '@components/mining/page'
import { selectApiServer } from '@stores/apps/selectors'
import { connect } from 'react-redux'
import { StartAppMiningSection } from '@pages/mining/sections/start-app-mining'
import { Hero } from '@pages/mining/sections/hero'
import { HowMuchSection } from '@pages/mining/sections/how-much-earn'
import { RankingSection } from '@pages/mining/sections/ranking'
import { PioneersSection } from '@pages/mining/sections/pioneers'
import { FAQSection } from '@pages/mining/sections/faq'
import { ModalRoot } from 'blockstack-ui'
import { Header } from '@components/mining/header'
import { Footer } from '@components/mining/footer'
import { trackEvent } from '@utils'

const handleBodyScroll = (on) =>
  on ? document.body.classList.remove('no-scroll') : document.body.classList.add('no-scroll')

const mapStateToProps = (state) => ({
  apiServer: selectApiServer(state)
})

class AppMiningPage extends React.Component {
  static async getInitialProps({ reduxStore }) {
    const api = selectApiServer(reduxStore.getState())
    try {
      const promises = await Promise.all([
        fetch(`${api}/api/app-mining-months`),
        fetch(`${api}/api/mining-faq`),
        fetch(`${api}/api/app-mining-apps`)
      ])
      const { months } = await promises[0].json()
      const { faqs } = await promises[1].json()
      const { apps } = await promises[2].json()

      if (months && months.length) {
        const rankings = months[months.length - 1].compositeRankings.map((app) => {
          const appWithLifetimeEarnings = apps.find((otherApp) => otherApp.name === app.name)
          return {
            ...appWithLifetimeEarnings,
            ...app
          }
        })

        const rankingMonths = months.map((month) => {
          const theApps = month.compositeRankings.map((app) => {
            const appWithLifetimeEarnings = apps.find((otherApp) => otherApp.name === app.name)
            return {
              ...appWithLifetimeEarnings,
              ...app
            }
          })

          return {
            ...month,
            apps: theApps
          }
        })
        return { rankings, month: months[months.length - 1], months, rankingMonths, faq: faqs, apps }
      } else {
        return {}
      }
    } catch (error) {
      return {}
    }
  }

  componentDidMount() {
    handleBodyScroll(true)
    trackEvent('View Mining Landing Page')
  }

  render() {
    return (
      <ModalRoot>
        <MiningPage>
          <Head
            title="App Mining"
            description="Every 30 days we payout $100k to the best apps built on Blockstack. The better your app, the more you earn."
            ogImage="/static/images/og.png"
          />
          <Header />

          <Hero minHeight="100vh" apps={this.props.rankings} position="relative" zIndex={1000} />
          <StartAppMiningSection />
          <HowMuchSection apps={this.props.rankings} months={this.props.rankingMonths} />
          <RankingSection apps={this.props.rankings} />
          <PioneersSection apps={this.props.months[0].compositeRankings} />
          <FAQSection faq={this.props.faq} apps={this.props.rankings} />
          <Footer />
        </MiningPage>
      </ModalRoot>
    )
  }
}

export default connect(mapStateToProps)(AppMiningPage)
