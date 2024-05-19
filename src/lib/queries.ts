import { gql } from "@apollo/client/core";

const PARTY_FRAGMENT = gql`
    fragment WholeParty on Party {
        id
        name
        password
        clients {
            id
            username
            privileges
            isConnected
        }
        bannedClients
        tracksQueue {
            username
            trackId
            trackName
        }
        maxClients
    }
`;

export const CREATE_PARTY = gql`
    ${PARTY_FRAGMENT}
    mutation CreateParty($username: String!, $party_name: String!, $creds: CredentialsInput!) {
        createParty(
            username: $username
            name: $party_name
            creds: $creds
        ) {
            ... on Party {
                ...WholeParty
            }
            ... on PartyError {
                error
            }
        }
    }
`;

export const GET_PARTY = gql`
    ${PARTY_FRAGMENT}
    query GetParty($id: Int!) {
        getParty(id: $id) {
            ...WholeParty
        }
    }
`;
