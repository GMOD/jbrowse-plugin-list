// Hands `text` to the browser as a file to save
export function downloadText(
  text: string,
  name: string,
  type = 'image/svg+xml',
) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 0)
}
