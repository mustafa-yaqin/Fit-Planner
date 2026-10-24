// Safety net: if a page crashes, shows a message instead of a blank screen.
import { Component } from 'react'

// Catches a crash inside a page so the visitor never sees a blank screen.
export default class ErrorBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('FitPlanner page error:', error?.message)
  }

  render() {
    if (!this.state.failed) return this.props.children
    const fa = document.documentElement.lang === 'fa'
    return (
      <div className="container-site py-24 text-center">
        <h1 className="text-2xl font-extrabold">{fa ? 'مشکلی پیش آمد' : 'Something went wrong'}</h1>
        <p className="mt-3 text-navy/80">
          {fa ? 'صفحه نمایش داده نشد. لطفاً دوباره تلاش کنید.' : 'The page could not be shown. Please try again.'}
        </p>
        <button type="button" className="btn-primary mt-6" onClick={() => window.location.assign('/')}>
          {fa ? 'بازگشت به خانه' : 'Back to home'}
        </button>
      </div>
    )
  }
}
