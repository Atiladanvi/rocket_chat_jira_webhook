const JIRA_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACRElEQVRYhbWXsUscQRTGf4iIyHHIISIWIsHisMgfkNIiBJFwiKQIkipVqpA/wEZEggSxEkmZwiKI5A84REKKkIMQrINYBQmHBDmEHJdNMW+42dk3d3O76wcDu2/e973vZvfN7EF+PAfaMjYL6AzFJFBRYh0gkdEBpryciuQVwjPgFugCu068CvQcAz1g2pnfEc6taOTGL6dIAjxw5nad+FsnvuhxrosYuPbElrz5Rc8Ucu9yfhcxsAncYZZ4fwTeO+HcUcILWgFqOXg1si9vFBrAXB7iEMySfYQZzGCeWxdoAq+Bh8BYjoJjwn0jWrYrqsOIbdIvUQLseTmPgHXgiYx1ibnYU3RuYpyfKMQ/mNWx+KzkfHHmZ4Tj55zGGNhQiAlw5OQ8VeYbzvxRQCNqUxoHLgMCa07eRyd+4sTXAtwrYCLGAJje1URugLrkVIHvMuyLVZccjfsitrhFMyD0k36bTtA/cOZkTuOckaOTFtA7IgEuSG9ONeBHILctWrnwGNO/mvA3zAk4LddaThfTpoXwKiBuVyL0yxPhloLtAUVCY7us4hb7IxQ/KLu4xWFE8cP7Kg6mld4PKH5BvoNrZBMfBphohKnFMAusyvU48ClgoA3M34eBUynwUu6ngK8BE1Gn3ihYccR79Jd5nuyXsx0rZRo498Q7mK8dMDudZuC8rOLLgQI7Ts5xIGe5DANbinCP9AfmEul/SnZslWHgTBFuKnna8a3lpRCzadSVWMiAj6GPIMbAX+/+H9BS8loyN4ibwX9j/jIXDkk+pgAAAABJRU5ErkJggg=='

function commentMessage(data) {
  let user = data.comment.author
  let author_name = user.displayName
  let jiraUrl = data.issue.self.replace(/\/rest\/.*$/, '')
  let author_url
  author_url = author_name.includes('.') === true ? 'https://bitbucket.org/' + author_name.split('.').join('_').toLowerCase() : 'https://bitbucket.org/' + author_name.replace(/\s/g, '').toLowerCase()
  let attachments = {
    author_name: user.displayName,
    author_icon: user.avatarUrls['16x16'],
    thumb_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAo0lEQVR4nM2VTQqEMAxGX8ocwPvMZsCL6Em0JxkPIrjxPs4NOov5QYukxnbhB4GSpI+Qj1IJIVBScn/UWr0HOgPPa8AKWAwwAJz1Qg7wVRp4So7P4sNOnAZaXDwELKrLA/0t0SBK7Qk0APM0/vs0oOa0AO333KwLqQlTauNE9g7nadxAHeCNDLX/91KErQHDKhdHnwLGGtjZzVHFwCwYgJT+At7SRx45ub1+PQAAAABJRU5ErkJggg==',
    title: `Comentário na tarefa: ${data.issue.key}`,
    title_link: `${jiraUrl}/browse/${data.issue.key}`,
    author_link: author_url
  }
  attachments.text = data.comment.body
  return attachments
}

class Script {
  process_incoming_request({request}) {
    const data = request.content
    let issue = data.issue
    let message = {
      icon_url: (issue.fields.project && issue.fields.project.avatarUrls && issue.fields.project.avatarUrls['48x48']) || JIRA_LOGO,
      attachments: []
    }
    try {
      if (data.webhookEvent === "comment_created") {
        message.attachments.push(commentMessage(data))
      }
      if (message.text || message.attachments.length) {
        return {
          content: message
        }
      }
    } catch (e) {
      console.log('jira error', e)
      return {
        error: {
          success: false,
          message: `${e.message || e} ${JSON.stringify(data)}`
        }
      }
    }
  }
}
