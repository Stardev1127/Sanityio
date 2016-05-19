
import Obj from './field-inputs/Object'
import Arr from './field-inputs/Array'
import Bool from './field-inputs/Boolean'
import Num from './field-inputs/Number'
import RichText from './field-inputs/RichText'
import Reference from './field-inputs/Reference'
import Str from './field-inputs/String'
import * as fbv from './FormBuilderValue'

const bundledFieldInputs = {
  object: Obj,
  array: Arr,
  boolean: Bool,
  number: Num,
  text: RichText,
  reference: Reference,
  string: Str
}

export const fieldInputs = bundledFieldInputs
export {compile as compileSchema} from './compileSchema'

export {default as FormBuilderProvider} from './FormBuilderProvider'
export {FormBuilder} from './FormBuilder'

export const FormBuilderValue = fbv
