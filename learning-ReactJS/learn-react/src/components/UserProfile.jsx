import { UserFavoriteFood } from "./UserFavoriteFood";

export function UserProfile(){
    return (
        <div id="user-profile">
            <p>Username: Wee</p>
            <div>
                <span>Email: </span>
                <span>wee@gmail.com</span> 
            </div>
            <section>
                <span>Favorite Food:</span>
                <br />
                <ul>
                    <li>Chicken</li>
                    <li>Beef</li>
                    <li>Pork</li>
                </ul>
            </section>
            <UserFavoriteFood />
        </div>
    )
}