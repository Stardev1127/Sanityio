import cheerio from 'cheerio'
import cleanUpWordDocument from './cleanUpWordDocument'

const wordRegexp = /(class="?Mso|style=(?:"|')[^"]*?\bmso-|w:WordDocument|<o:\w+>|<\/font>)/

function isUnwantedElement(index, node) {
  return node.type === 'comment' || node.type === 'directive'
}

export function isPastedFromGoogleDocs(el) {
  return el.attribs
    && el.attribs.id
    && el.attribs.id.match(/^docs-internal-guid-/)
}

export function cleanupHtml(html) {
  const isWordDocument = wordRegexp.test(html)
  let doc = null
  try {
    doc = cheerio.load(cheerio.load(html)('body').html())
  } catch (err) {
    doc = cheerio.load(html)
  }
  doc.root()
    .find('*')
    .contents()
    .filter(isUnwantedElement)
    .remove()

  if (isWordDocument) {
    doc = cleanUpWordDocument(doc)
  }
  const cleanHtml = doc.html()
    .trim()   // Trim whitespace
    .replace(/[\r\n]+/g, ' ') // Remove newlines / carriage returns
    .replace(/ {2,}/g, ' ') // Remove trailing spaces
  return cleanHtml
}

export function resolveListItem(listNodeTagName) {
  let listStyle
  switch (listNodeTagName) {
    case 'ul':
      listStyle = 'bullet'
      break
    case 'ol':
      listStyle = 'number'
      break
    default:
      listStyle = 'bullet'
  }
  return listStyle
}
