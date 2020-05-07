const {buildSchema} = require('graphql');

module.exports = buildSchema(`
  type testData {
    text:String!
    value:Int! 
  }
type RootQuery{
  hello: testData! 
}
  schema {
    query : RootQuery

  }
`)