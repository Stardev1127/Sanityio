/* eslint-disable react/style-prop-object */

import {Card, Container, Flex} from '@sanity/ui'
import {useBoolean} from '@sanity/ui-workshop'
import React from 'react'
import {TextBlock} from '../TextBlock'

export default function TestStory() {
  const hasErrors = useBoolean('Has errors', false)

  return (
    <Flex align="center" height="fill" justify="center" padding={4} sizing="border">
      <Container width={1}>
        <Card padding={3} shadow={1}>
          <TextBlock hasError={hasErrors} style="h1">
            Hello, world
          </TextBlock>
          <TextBlock hasError={hasErrors} style="h2">
            Hello, world
          </TextBlock>
          <TextBlock hasError={hasErrors} style="h3">
            Hello, world
          </TextBlock>
          <TextBlock hasError={hasErrors} style="h4">
            Hello, world
          </TextBlock>
          <TextBlock hasError={hasErrors} style="h5">
            Hello, world
          </TextBlock>
          <TextBlock hasError={hasErrors} style="h6">
            Hello, world
          </TextBlock>

          <TextBlock>Paragraph</TextBlock>
          <TextBlock hasError={hasErrors} style="blockquote">
            Blockquote
          </TextBlock>

          <TextBlock hasError={hasErrors} listItem="bullet">
            Hello, world
          </TextBlock>
          <TextBlock hasError={hasErrors} listItem="bullet">
            Hello, world
          </TextBlock>
          <TextBlock hasError={hasErrors} listItem="bullet">
            Hello, world
          </TextBlock>

          <TextBlock hasError={hasErrors} listItem="number">
            Hello, world
          </TextBlock>
          <TextBlock hasError={hasErrors} listItem="number">
            Hello, world
          </TextBlock>
          <TextBlock hasError={hasErrors} listItem="number">
            Hello, world
          </TextBlock>
        </Card>
      </Container>
    </Flex>
  )
}
