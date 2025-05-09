export async function getCoordinatesFromAddress(
  address: string,
): Promise<{ lat: number; lon: number } | null> {
  if (!address || address.trim().length === 0) return null

  const url = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(address)}&fuzzy=false&utkoordsys=4258&treffPerSide=1&side=0&asciiKompatibel=true`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (data.adresser && data.adresser.length > 0) {
      const point = data.adresser[0].representasjonspunkt
      return point ? { lat: point.lat, lon: point.lon } : null
    }
    return null
  } catch {
    return null
  }
}
