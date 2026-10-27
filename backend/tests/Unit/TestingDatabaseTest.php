<?php

namespace Tests\Unit;

use Tests\TestCase;

class TestingDatabaseTest extends TestCase
{
    public function test_phpunit_uses_sqlite_memory_and_the_array_mailer(): void
    {
        $this->assertSame('sqlite', config('database.default'));
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
        $this->assertSame('array', config('mail.default'));
    }
}
