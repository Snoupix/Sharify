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
    mutation CreateParty($user_id: String!, $username: String!, $party_name: String!, $creds: CredentialsInput!) {
        createParty(userId: $user_id, username: $username, name: $party_name, creds: $creds) {
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
    mutation LeaveParty($id: Int!, $client_id: String!) {
        leaveParty(id: $id, clientId: $client_id) {
            error
        }
    }
`;

export const JOIN_PARTY = gql`
    ${PARTY_FRAGMENT}
    mutation JoinParty($id: Int!, $username: String!, $user_id: String!) {
        joinParty(id: $id, username: $username, userId: $user_id) {
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
    mutation KickUser($id: Int!, $client_id: String!) {
        kickUser(id: $id, userId: $client_id) {
            error
        }
    }
`;

export const BAN_CLIENT = gql`
    mutation BanUser($id: Int!, $client_id: String!) {
        banUser(id: $id, userId: $client_id) {
            error
        }
    }
`;

export const PROMOTE_CLIENT = gql`
    mutation PromoteUser($id: Int!, $client_id: String!, $target_id: String!) {
        promoteUser(id: $id, userId: $client_id, targetId: $target_id) {
            error
        }
    }
`;

export const DEMOTE_CLIENT = gql`
    mutation DemoteUser($id: Int!, $client_id: String!, $target_id: String!) {
        demoteUser(id: $id, userId: $client_id, targetId: $target_id) {
            error
        }
    }
`;
