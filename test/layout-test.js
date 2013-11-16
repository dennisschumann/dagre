var assert = require('./assert'),
    layout = require('..').layout,
    decode = require('graphlib').converter.json.decode,
    Graph = require('graphlib').Graph;
    Digraph = require('graphlib').Digraph;

describe('layout', function() {
  it('preserves edge ids for graphs with edges spanning multiple ranks', function() {
    var g = new Digraph();
    g.addNode(1);
    g.addNode(2);
    g.addNode(3);
    g.addEdge('1->2', 1, 2);
    g.addEdge('2->3', 2, 3);
    g.addEdge('1->3', 1, 3);
    layout.apply(g);
    assert.include(g.edges(), '1->3');
  });

  it('performs simple layout for Graph without error', function() {
    var nodes = [{id: 1, value: {width: 10, height: 10}},
                 {id: 2, value: {width: 10, height: 10}}];
    var edges = [{u: 1, v: 2}];

    var g = layout()
      .run(decode(nodes, edges, Graph));

    // Simple check. node 1 and node 2 should not have the same y-coordiante.
    var n1y = g.node(1).y;
    var n2y = g.node(2).y;
    assert.notEqual(n1y, n2y);
  });

  it('does not add dummy edges', function() {
    var inputGraph = new Digraph();
    inputGraph.addNode(1);
    inputGraph.addNode(2);
    inputGraph.addEdge('foo', 1, 2, { minLen: 4 });

    var outputGraph = layout().run(inputGraph);

    assert.sameMembers(outputGraph.edges(), ['foo']);
  });

  it('includes bounding box information', function() {
    var inputGraph = new Digraph();
    inputGraph.addNode(1, { width: 50, height: 20 });
    inputGraph.addNode(2, { width: 100, height: 30 });
    inputGraph.addEdge(null, 1, 2, {});

    var outputGraph = layout().run(inputGraph);

    assert.equal(outputGraph.graph().bbox.width, 100);
    assert.equal(outputGraph.graph().bbox.height, 20 + 30 + layout().rankSep());
  });
});
