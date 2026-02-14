const { GraphQLClient, gql } = require('graphql-request');
require('dotenv').config({ path: '.env' });

const client = new GraphQLClient('https://backboard.railway.app/graphql/v2', {
    headers: { Authorization: `Bearer ${process.env.RAILWAY_API_TOKEN}` },
});

async function testQueries() {
    console.log('Testing "me { id }" query...');
    try {
        const d = await client.request(gql`{ me { id } }`);
        console.log('SUCCESS "me":', d);
    } catch (e) {
        console.log('FAILED "me":', e.message.split('\n')[0]);
    }

    console.log('\nTesting "projects { edges ... }" (root) query...');
    try {
        const d = await client.request(gql`{ projects { edges { node { id name } } } }`);
        console.log('SUCCESS "projects":', JSON.stringify(d, null, 2));
    } catch (e) {
        console.log('FAILED "projects":', e.message.split('\n')[0]);
    }

    console.log('\nTesting "environments { edges ... }" (root) query...');
    try {
        const d = await client.request(gql`{ environments { edges { node { id name } } } }`);
        console.log('SUCCESS "environments":', JSON.stringify(d, null, 2));
    } catch (e) {
        console.log('FAILED "environments":', e.message.split('\n')[0]);
    }
}

testQueries();
