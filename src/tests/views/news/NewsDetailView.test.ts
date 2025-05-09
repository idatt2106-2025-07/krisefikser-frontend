import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import NewsDetailView from '@/views/news/NewsDetailView.vue'
import axios from 'axios'

vi.mock('axios')

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
}))

import { useRoute } from 'vue-router'

describe('NewsDetailView', () => {
  const mockArticle = {
    id: 1,
    title: 'Test News Article',
    content: '<p>This is a test article content.</p>',
    publishedAt: '2023-05-15T12:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useRoute).mockReturnValue({
      params: { id: '1' },
    } as any)
  })

  it('displays loading state initially', () => {
    vi.mocked(axios.get).mockReturnValue(new Promise(() => {}))

    const wrapper = mount(NewsDetailView)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('fetches and displays a news article', async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: mockArticle })

    const wrapper = mount(NewsDetailView)

    await flushPromises()

    expect(wrapper.find('h1').text()).toBe('Test News Article')
    expect(wrapper.find('.content').exists()).toBe(true)
    expect(wrapper.find('.content').html()).toContain('This is a test article content.')
    expect(wrapper.find('.meta').text()).toContain('Published:')

    expect(axios.get).toHaveBeenCalledWith('/api/news/1')
  })

  it('displays error message when API call fails', async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error('API Error'))

    const wrapper = mount(NewsDetailView)
    await flushPromises()

    expect(wrapper.find('.error').exists()).toBe(true)
    expect(wrapper.find('.error').text()).toBe('Could not load news article.')
    expect(wrapper.find('h1').exists()).toBe(false)
  })

  it('passes the correct article ID from route params', async () => {
    vi.mocked(useRoute).mockReturnValue({
      params: { id: '42' },
    } as any)

    vi.mocked(axios.get).mockResolvedValue({ data: { ...mockArticle, id: 42 } })

    mount(NewsDetailView)
    await flushPromises()

    expect(axios.get).toHaveBeenCalledWith('/api/news/42')
  })

  it('correctly formats the published date', async () => {
    const fixedDate = '2023-05-15T12:00:00Z'
    const expectedFormattedDate = new Date(fixedDate).toLocaleString()

    vi.mocked(axios.get).mockResolvedValue({
      data: { ...mockArticle, publishedAt: fixedDate },
    })

    const wrapper = mount(NewsDetailView)
    await flushPromises()

    expect(wrapper.find('.meta').text()).toBe(`Published: ${expectedFormattedDate}`)
  })
})
