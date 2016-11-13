/* eslint-disable id-length, quote-props */

export default [
  {
    name: 'Simple path unset',
    before: {
      a: {
        b: 7,
        c: 10
      }
    },
    patch: {
      unset: ['a.b']
    },
    after: {
      a: {
        c: 10
      }
    }
  },

  {
    name: 'Simple array unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[2]']
    },
    after: {
      a: [0, 10, 30, 40, 50]
    }
  },

  {
    name: 'Range unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[:3]']
    },
    after: {
      a: [30, 40, 50]
    }
  },

  {
    name: 'Missing index unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[103]']
    },
    after: {
      a: [0, 10, 20, 30, 40, 50]
    }
  },

  {
    name: 'Missing attribute unset',
    before: {
      a: {
        b: 7,
        c: 10
      }
    },
    patch: {
      unset: ['a.d']
    },
    after: {
      a: {
        b: 7,
        c: 10
      }
    }
  },

  {
    name: 'Union unset',
    before: {
      a: {
        b: 7,
        c: 10
      }
    },
    patch: {
      unset: ['a[b,c]']
    },
    after: {
      a: {}
    }
  },

  {
    name: 'Negative index unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[-1]']
    },
    after: {
      a: [0, 10, 20, 30, 40]
    }
  },

  {
    name: 'Negative index range unset',
    before: {
      a: [0, 10, 20, 30, 40, 50]
    },
    patch: {
      unset: ['a[-3:-1]']
    },
    after: {
      a: [0, 10, 20, 50]
    }
  },


]
