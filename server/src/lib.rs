use prisma_client_rust::*;

// Example async function to get all users
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = PrismaClient::_builder().build().await?;
    let users = client.user().find_many(vec![]).exec().await?;
    println!("{:?}", users);
    Ok(())
} 