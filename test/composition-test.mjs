#external (describe, it)

#metaimport masakari
#metaimport hash-require

#require
  chai expect
  '../main' compose

describe
  '#compose'
  #->

    it
      'can compose independent components'
      #->
        var system = compose {a: #-> ::a, b: #-> ::b}
        (expect system).to.eql {a: ::a, b: ::b}

    it
      'can compose interdependent components'
      #->
        var system = compose {
          a: (b, c) -> ::a + b + c
          b: #-> ::b
          c: b -> ::c + b
          d: (c, b, a) -> ::d + c + b + a}
        (expect system).to.eql {
          a: ::abcb
          b: ::b
          c: ::cb
          d: ::dcbbabcb}

    it
      'throws when there are dependency cycles'
      #->
        var action = #-> compose {a: b -> ::a + b, b: a -> ::b + a}
        (expect action).to.throw "Dependency cycle detected between `a' and `b'."

    it
      'represents missing dependencies with undefined'
      #->
        var system = compose {a: b -> typeof b}
        (expect system).to.eql {
          a: ::undefined
          b: undefined}

    it
      'can satisfy camelCase dependencies with lisp-case components'
      #->
        var system = compose {
          ::component-a: #-> ::a
          b: componentA -> ::b + component-a}
        (expect system).to.eql {
          ::component-a: ::a
          b: ::ba}
