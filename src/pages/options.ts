import { StorageKey } from '../constants'
import type { Options } from '../types'
import { getStorage, setStorage } from '../utils'

const saveOptions = async () => {
  const $save = $('#save')
  const originText = $save.text()

  const currentOptions: Options = {
    openInNewTab: $('#openInNewTab').prop('checked'),
    autoCheckIn: {
      enabled: $('#autoCheckIn').prop('checked'),
    },
    theme: {
      autoSwitch: $('#autoSwitch').prop('checked'),
    },
    reply: {
      preload: (() => {
        const off = $('#reply_preload_off').prop('checked')
        const auto = $('#reply_preload_auto').prop('checked')

        if (off) {
          return 'off' as const
        }

        if (auto) {
          return 'auto' as const
        }

        return undefined
      })(),
    },
    replyContent: {
      autoFold: $('#autoFold').prop('checked'),
    },
    nestedReply: {
      display: $('input[name="nestedReplyDisplay"]:checked').prop('value'),
    },
  }

  await setStorage(StorageKey.Options, currentOptions)

  $save.addClass('success').text('保存成功')

  setTimeout(() => {
    $save.removeClass('success').text(originText)
  }, 1500)
}

$('#options-form').on('submit', (ev) => {
  ev.preventDefault() // 阻止默认的表单提交行为
  void saveOptions()
})

void (async function init() {
  const storage = await getStorage()
  const options = storage[StorageKey.Options]
  $('#openInNewTab').prop('checked', options.openInNewTab)
  $('#autoCheckIn').prop('checked', options.autoCheckIn.enabled)
  $('#autoSwitch').prop('checked', options.theme.autoSwitch)
  $('#autoFold').prop('checked', options.replyContent.autoFold)

  $('#displayAlign').prop('checked', options.nestedReply.display === 'align')
  $('#displayIndent').prop('checked', options.nestedReply.display === 'indent')

  $('#reply_preload_off').prop('checked', options.reply.preload === 'off')
  $('#reply_preload_auto').prop('checked', options.reply.preload === 'auto')
})()
