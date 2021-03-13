import React from "react";
import { Link } from "react-router-dom";
import { useUsersQuery } from "../generated/graphql";

interface Props {}

export const Home: React.FC<Props> = (props: Props) => {
  const {data} = useUsersQuery({
    fetchPolicy: 'network-only'
  })

  if(!data) {
    return <div>loading...</div>
  }
  return (
    <div>
     <h3>users:</h3>
      <ul>
        {data.Users.map(x=> (
          <li key={x.id}>
            {x.email}, {x.id}
          </li>
        ))}
      </ul>
    </div>
  );
};
