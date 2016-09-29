import React from 'react'

const styles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  border: '10px solid red'
}

const CenterDecorator = story => (
  <div style={styles}>
    {story()}
  </div>
)

export default CenterDecorator
