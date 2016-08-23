import styles from 'style:@sanity/components/fieldsets/default'
import React, {PropTypes} from 'react'

export default function Fieldset(props) {
  const {fieldset, legend, description} = props
  return (
    <fieldset className={styles.root} data-nesting-level={props.level}>
      <legend className={styles.legend}>{legend || fieldset.legend}</legend>
      <div className={styles.inner}>
        {
          (description || fieldset.description)
          && <p className={styles.description}>
              {description || fieldset.description}
          </p>
        }
        <div className={styles.content}>
          {props.children}
        </div>
      </div>
    </fieldset>
  )
}

Fieldset.defaultProps = {
  fieldset: {}
}

Fieldset.propTypes = {
  description: PropTypes.string,
  legend: PropTypes.string.isRequired,
  fieldset: PropTypes.shape({
    description: PropTypes.string,
    legend: PropTypes.string
  }),
  children: PropTypes.node,
  level: PropTypes.number
}
