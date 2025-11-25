import type { FC } from 'react'
import type { BlockObjects } from '@botpress/webchat'

const CustomTextRenderer: FC<BlockObjects['custom']> = (props) => {
  return (
    <div>
      <span className="shimmer-text bpMessageBlocksBubble">
        {props.name}
      </span>
    </div>
  )
}

export default CustomTextRenderer