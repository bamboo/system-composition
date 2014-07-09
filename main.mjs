#metaimport masakari
#metaimport hash-require

#require
  dependency-graph DepGraph
  get-parameter-names

fun dependencies-of component ->
  get-parameter-names component

fun camel-case-to-lisp-case name ->
  var pattern = new RegExp '[A-Z]'
  name.replace
    pattern
    #-> '-' + #it.to-lower-case ()

fun dependency-graph-for component-map ->
  var result = new DepGraph ()

  var ks = Object.keys component-map
  ks.for-each k ->
    result.add-node k

  fun resolve d ->
    if (result.has-node d) d
    else do
      var lisp-case = camel-case-to-lisp-case d
      if (result.has-node lisp-case) lisp-case
      else null

  var direct-deps = {}
  ks.for-each k ->
    var component = component-map[k]
    if !(component instanceof Function)
      throw Error ('Invalid component definition for `' + k + "': " + component)
    direct-deps[k] = []
    fun add-dependency d ->
      direct-deps[k].push d
      result.add-dependency (k, d)
    (dependencies-of component).for-each d -> do!
      var resolved = resolve d
      if resolved
        if (result.dependencies-of (resolved).index-of (k) >= 0)
          throw Error ('Dependency cycle detected between `' + resolved + "' and `" + k + "'.")
        add-dependency resolved
      else
        console.log ('WARNING: component `' + k + "' is missing dependency `" + d + "'")
        result.add-node d
        add-dependency d

  result.direct-dependencies-of = k -> direct-deps[k]
  result

fun compose component-map ->
  var dg = dependency-graph-for component-map
  var system = {}
  fun instantiate k ->
    if (var c = component-map[k])
      c.apply
        this
        dg.direct-dependencies-of (k).map d -> system[d]
    else
      undefined
  dg.overall-order ().for-each k ->
    system[k] = instantiate k
  system

fun singleton s ->
  #-> s

#export
  compose
  singleton
