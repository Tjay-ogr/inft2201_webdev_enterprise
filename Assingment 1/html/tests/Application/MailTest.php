<?php
use PHPUnit\Framework\TestCase;
use Application\Mail;

class MailTest extends TestCase {
    protected PDO $pdo;

    protected function setUp(): void
    {
        $dsn = "pgsql:host=" . getenv('DB_TEST_HOST') . ";dbname=" . getenv('DB_TEST_NAME');
        $this->pdo = new PDO($dsn, getenv('DB_USER'), getenv('DB_PASS'));
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Clean and reinitialize the table
        $this->pdo->exec("DROP TABLE IF EXISTS mail;");
        $this->pdo->exec("
            CREATE TABLE mail (
                id SERIAL PRIMARY KEY,
                subject TEXT NOT NULL,
                body TEXT NOT NULL
            );
        ");
    }

    public function testCreateMail() {
        $mail = new Mail($this->pdo);
        $id = $mail->createMail("Alice", "Hello world");
        $this->assertIsInt($id);
        $this->assertEquals(1, $id);
    }
       public function testGetMail() {
        $mail = new Mail($this->pdo);

        $id = $mail->createMail("Test Subject", "Test Body");

        $result = $mail->getMail($id);

        $this->assertEquals("Test Subject", $result['subject']);
        $this->assertEquals("Test Body", $result['body']);
    }

    public function testGetAllMail()
{
    $mail = new Mail($this->pdo);

    $mail->createMail("First", "Body1");
    $mail->createMail("Second", "Body2");

    $all = $mail->getAllMail();

    $this->assertCount(2, $all);
    $this->assertEquals("First", $all[0]['subject']);
    $this->assertEquals("Second", $all[1]['subject']);
}
public function testUpdateMail()
{
    $mail = new Mail($this->pdo);

    $id = $mail->createMail("Old Subject", "Old Body");

    $updated = $mail->updateMail($id, "New Subject", "New Body");

    $this->assertTrue($updated);

    $result = $mail->getMail($id);

    $this->assertEquals("New Subject", $result['subject']);
    $this->assertEquals("New Body", $result['body']);
}
public function testDeleteMail()
{
    $mail = new Mail($this->pdo);

    $id = $mail->createMail("Delete Me", "Temporary");

    $deleted = $mail->deleteMail($id);

    $this->assertTrue($deleted);

    $result = $mail->getMail($id);

    $this->assertFalse($result);
}


}