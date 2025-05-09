import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NewsView from '@/views/news/NewsView.vue'
import axios from 'axios'
import { createRouter, createWebHistory } from 'vue-router'

// Mock axios
vi.mock('axios')

describe('NewsView', () => {
  const mockArticles = [
    { id: 1, title: 'First News Article', publishedAt: '2023-05-15T10:00:00Z' },
    { id: 2, title: 'Second News Article', publishedAt: '2023-05-16T14:30:00Z' },
  ]

  // Create a mock router
  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/news/:id', name: 'news-detail', component: { template: '<div>News Detail</div>' } },
    ],
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the news page title', () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] })
    const wrapper = mount(NewsView, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.find('h1').text()).toBe('News')
  })

  it('fetches news articles on mount and displays them', async () => {
    // Mock successful API response
    vi.mocked(axios.get).mockResolvedValue({ data: mockArticles })

    const wrapper = mount(NewsView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    // Check if articles are rendered
    const articleCards = wrapper.findAll('.article-card')
    expect(articleCards.length).toBe(2)

    // Check first article content
    expect(articleCards[0].find('h2').text()).toBe('First News Article')
    expect(articleCards[0].find('.date').text()).toBe(
      new Date('2023-05-15T10:00:00Z').toLocaleDateString(),
    )

    // Check API call
    expect(axios.get).toHaveBeenCalledWith('/api/news')
  })

  it('displays error message when API call fails', async () => {
    // Mock API error
    vi.mocked(axios.get).mockRejectedValue(new Error('API Error'))

    const wrapper = mount(NewsView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    // Error message should be displayed
    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.find('.error').text()).toBe('Failed to load news articles.')

    // No articles should be displayed
    expect(wrapper.findAll('.article-card').length).toBe(0)
  })

  it('formats dates correctly', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: mockArticles })

    const wrapper = mount(NewsView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    const dates = wrapper.findAll('.date')
    expect(dates[0].text()).toBe(new Date('2023-05-15T10:00:00Z').toLocaleDateString())
    expect(dates[1].text()).toBe(new Date('2023-05-16T14:30:00Z').toLocaleDateString())
  })

  it('navigates to article detail when an article is clicked', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: mockArticles })

    // Spy on router.push
    const pushSpy = vi.spyOn(router, 'push')

    const wrapper = mount(NewsView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    // Click on the first article
    await wrapper.findAll('.article-card')[0].trigger('click')

    // Check if router.push was called with the correct path
    expect(pushSpy).toHaveBeenCalledWith('/news/1')

    // Click on the second article
    await wrapper.findAll('.article-card')[1].trigger('click')

    // Check if router.push was called with the correct path
    expect(pushSpy).toHaveBeenCalledWith('/news/2')
  })

  it('renders empty list when no articles are available', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: [] })

    const wrapper = mount(NewsView, {
      global: {
        plugins: [router],
      },
    })

    await flushPromises()

    // No article cards should be displayed
    expect(wrapper.findAll('.article-card').length).toBe(0)
    // And no error should be displayed
    expect(wrapper.find('.error').exists()).toBe(false)
  })
})
