import { createButton } from '../../components/button'
import { hoverDelay, type PopupControl } from '../../components/popup'
import { fetchUserInfo } from '../../services'
import type { CommentData, Member } from '../../types'
import { formatTimestamp } from '../../utils'

const memberDataCache = new Map<Member['username'], Member>()

interface ProcessAvatar {
  $cellDom: JQuery
  popupControl: PopupControl
  commentData: CommentData
  onSetTagsClick?: () => void
}

/**
 * 处理用户头像元素：
 *  - 点击头像会展示该用户的信息。
 */
export function processAvatar(params: ProcessAvatar) {
  const { $cellDom, popupControl, commentData, onSetTagsClick: onSetTags } = params

  const { memberName, memberAvatar, memberLink } = commentData

  let abortController: AbortController | null = null

  const $avatar = $cellDom.find('.avatar')

  const handleOver = () => {
    popupControl.close()
    popupControl.open($avatar)

    const $content = $(`
      <div class="v2p-member-card">
        <div class="v2p-info">
          <div class="v2p-info-left">
            <a class="v2p-avatar-box" href="${memberLink}">
              <img class="v2p-avatar" src="${memberAvatar}">
            </a>
          </div>

          <div class="v2p-info-right">
            <div class="v2p-username">
              <a href="${memberLink}">${memberName}</a>
            </div>
            <div class="v2p-no v2p-loading"></div>
            <div class="v2p-created-date v2p-loading"></div>
          </div>

          </div>

          <div class="v2p-bio" style="disply:none;"></div>

          <div class="v2p-member-card-actions"></div>
      </div>
    `)

    popupControl.$content.empty().append($content)

    createButton({ children: '添加用户标签' })
      .on('click', () => {
        popupControl.close()
        onSetTags?.()
      })
      .appendTo($('.v2p-member-card-actions'))

    void (async () => {
      // 缓存用户卡片的信息，只有在无缓存时才请求远程数据。
      if (!memberDataCache.has(memberName)) {
        abortController = new AbortController()

        popupControl.onClose = () => {
          abortController?.abort()
        }

        try {
          const memberData = await fetchUserInfo(memberName, {
            signal: abortController.signal,
          })

          memberDataCache.set(memberName, memberData)
        } catch (err) {
          if (err && typeof err === 'object' && 'name' in err && err.name !== 'AbortError') {
            $content.html(`<span>获取用户信息失败</span>`)
          }
          return null
        }
      }

      const data = memberDataCache.get(memberName)

      if (data) {
        $content.find('.v2p-no').removeClass('v2p-loading').text(`V2EX 第 ${data.id} 号会员`)

        $content
          .find('.v2p-created-date')
          .removeClass('v2p-loading')
          .text(`加入于 ${formatTimestamp(data.created)}`)

        if (data.bio && data.bio.trim().length > 0) {
          $content.find('.v2p-bio').css('disply', 'block').text(data.bio)
        }
      }
    })()
  }

  let isOver = false

  $avatar
    .on('mouseover', () => {
      isOver = true
      setTimeout(() => {
        if (isOver) {
          handleOver()
        }
      }, hoverDelay)
    })
    .on('mouseleave', () => {
      isOver = false
      setTimeout(() => {
        if (!popupControl.isOver && !isOver) {
          popupControl.close()
        }
      }, hoverDelay)
    })
    .wrap(`<a href="/member/${commentData.memberName}" style="cursor: pointer;">`)
}
