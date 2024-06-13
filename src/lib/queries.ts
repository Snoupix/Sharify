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
        createParty(username: $username, name: $party_name, creds: $creds) {
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

export const LEAVE_PARTY = gql`
    mutation LeaveParty($id: Int!, $client_id: Int!) {
        leaveParty(id: $id, clientId: $client_id) {
            error
        }
    }
`;

export const JOIN_PARTY = gql`
    ${PARTY_FRAGMENT}
    mutation JoinParty($id: Int!, $username: String!) {
        joinParty(id: $id, username: $username) {
            ... on Party {
                ...WholeParty
            }
            ... on PartyError {
                error
            }
        }
    }
`;

export const KICK_CLIENT = gql`
    mutation KickUser($id: Int!, $client_id: Int!) {
        kickUser(id: $id, userId: $client_id) {
            error
        }
    }
`;

export const BAN_CLIENT = gql`
    mutation BanUser($id: Int!, $client_id: Int!) {
        banUser(id: $id, userId: $client_id) {
            error
        }
    }
`;
